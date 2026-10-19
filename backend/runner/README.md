# Remote C execution runner

VirVerse's Vercel API cannot access a Docker daemon or run isolated Docker containers. Keep the React app and Express API on Vercel, and run this service on a dedicated Linux VM with Docker. The existing `runner/Dockerfile` remains the isolated GCC image; the runner service only validates requests and asks the host Docker daemon to create short-lived, network-disabled containers.

## Security boundary

- Student C source is compiled and run only inside `virvese-c-runner` containers, never in the Express API or runner Node.js process.
- Execution containers have no network, dropped Linux capabilities, `no-new-privileges`, memory/CPU/PID limits, read-only runtime filesystems, output/time limits, and size/fd limits.
- The API-to-runner HTTP endpoint uses an HMAC signature, timestamp, and one-use nonce. Interactive WebSockets use a 30-second, signed, one-use ticket and enforce the configured frontend origin.
- The runner has no MongoDB credentials. Hidden tests and judging remain in the API.
- The runner needs `/var/run/docker.sock`; access to that socket is effectively root access to its VM. Use a dedicated host, never expose the socket on TCP, and do not run unrelated workloads there.
- Caddy provides public HTTPS/WSS. The Node runner port is bound to host loopback only; expose only SSH (restricted to your IP), HTTP, and HTTPS in the cloud firewall.

## Oracle Cloud Always Free deployment

Always Free is a best-effort demo/beta host, not dependable production infrastructure: A1 capacity can be unavailable, free instances may be reclaimed under Oracle's idle-resource policy, and Always Free has no SLA/support. The account also requires payment-card identity verification. See [Oracle Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) and the [Free Tier FAQ](https://www.oracle.com/cloud/free/faq/). For production with uptime expectations, use a paid VM or managed container host with persistent capacity and monitoring.

1. Create an Ubuntu ARM64 A1 Flex VM in an Always Free eligible availability domain (up to the account's shared 2 OCPU / 12 GB A1 allowance). Keep the VM dedicated to this runner.
2. Assign a reserved public IP. Add a DNS `A` record such as `runner.example.com` pointing to it. Use a domain you control; Vercel's `vercel.app` domain cannot be delegated for this hostname.
3. In the OCI network security list, allow inbound TCP 22 only from your IP, plus TCP 80 and 443 for certificate issuance and HTTPS/WSS. Do **not** allow 5002 or Docker's port 2375.
4. Install Docker Engine with the official [Docker Ubuntu instructions](https://docs.docker.com/engine/install/ubuntu/) and install Caddy using its [official instructions](https://caddyserver.com/docs/install). Confirm `docker compose version` works.
5. Copy the repository to the VM. From its root, build the existing sandbox image and create the shared work directory:

   ```sh
   docker build -t virvese-c-runner:latest -f backend/runner/Dockerfile backend/runner
   sudo install -d -m 0777 /srv/virvese/work
   ```

   The directory is mounted at the same absolute path in the runner service container and on the host because Docker resolves bind mounts on the host.
6. Create `backend/runner/.env` from `.env.example`, set `RUNNER_ALLOWED_ORIGIN` to the exact deployed frontend origin (currently `https://vir-verse-saga.vercel.app`), and replace both secret values with distinct random values. Generate each locally with `openssl rand -hex 32`; never use either value as a `VITE_*` variable. Restrict the file:

   ```sh
   chmod 600 backend/runner/.env
   ```

7. Copy `backend/runner/Caddyfile.example` to `/etc/caddy/Caddyfile`, replacing the example hostname with your DNS name:

   ```caddyfile
   runner.example.com {
     reverse_proxy 127.0.0.1:5002
   }
   ```

   Reload Caddy and confirm it obtains a valid certificate. Caddy must be able to reach the runner at `127.0.0.1:5002`.
8. Start the runner from the repository root:

   ```sh
   docker compose --env-file backend/runner/.env -f backend/runner/compose.yaml up -d --build
   docker compose --env-file backend/runner/.env -f backend/runner/compose.yaml ps
   ```

9. Configure the **backend API** Vercel project's Production environment with server-only values:

   ```text
   EXECUTION_DRIVER=remote
   RUNNER_URL=https://runner.example.com
   RUNNER_SERVICE_SECRET=<same value as runner .env>
   RUNNER_TICKET_SECRET=<same value as runner .env>
   ```

   Do not set `RUNNER_IMAGE` on Vercel; the image exists only on the VM's Docker host. Keep `JWT_SECRET` and `MONGO_URI` in the backend project only.
10. Configure the **frontend** Vercel project's Production build environment:

   ```text
   VITE_RUNNER_WS_URL=wss://runner.example.com/interactive
   ```

   This URL is public, not a secret. Keep `VITE_API_URL` unset (or `/api`) so the existing Vercel API rewrite remains in use. Redeploy both Vercel projects after changing their environment variables.

## Local development

Leave `VITE_RUNNER_WS_URL` unset for the existing local cookie-authenticated API WebSocket. For local end-to-end testing of the remote flow, start the runner with a development/test execution driver and use an HTTPS/WSS tunnel only on a trusted network. Do not expose Docker or the runner port directly to the internet.

## Verification

1. `curl -i https://runner.example.com/health` should return `200` and `{"status":"ok"}`.
2. A direct unauthenticated `POST /internal/v1/execute` must return `401`. Do not add the HMAC secrets to browser requests.
3. In the deployed Playground, compile and run a program that reads a number with `scanf` and prints it. Confirm stdin/stdout and interactive prompts work.
4. Submit an intentionally malformed program such as `int main( {` and confirm the UI reports a compilation error, not a runner configuration error.
5. Submit a known practice problem and verify its result. The API continues to judge the test cases and filter hidden-case details; the runner response is internal only.
6. Confirm the runner VM firewall exposes no port 5002 or 2375 and that Caddy is the only public path to the service.

Run the focused backend integration test with `node --test --test-name-pattern="remote runner" src/tests/runnerService.test.js` from `backend`. It exercises HMAC rejection/replay protection, batch stdin/stdout, compilation errors, and sequential interactive `scanf` input using the local macOS sandbox. On a non-macOS machine the C integration portion is skipped unless adapted to use the Docker runner image. Run the frontend build with `npm run build` from `frontend`.

## Operations and limits

- Keep one runner instance unless you add a shared replay store for HMAC nonces and interactive ticket IDs. The built-in replay cache is process-local.
- Monitor VM disk, memory, Docker containers, and Caddy certificates. Alert on repeated health-check failures. Do not add a restart loop or public Docker endpoint as a substitute for observability.
- Vercel and the API provider impose request-duration limits. Configure the backend Vercel function for at least 60 seconds where the selected plan permits it; a shorter platform limit can terminate submissions early. The API client times out runner requests after 60 seconds, and client disconnects cancel queued/running work in the runner. If longer jobs are required, the API must move to a host with a suitable request duration or adopt an asynchronous job contract (which would change the current synchronous response flow).
- Update the sandbox base image and GCC image regularly. Review Docker security updates and preserve a rollback image tag before upgrades.
