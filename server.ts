import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { getToken } from "next-auth/jwt";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);
  (globalThis as any).io = io;            // lets your API routes reach this same io

  // Only logged-in owners may connect: reuse the existing next-auth cookie
  io.use(async (socket, proceed) => {
    const token = await getToken({
      req: { headers: socket.request.headers } as any,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const id = (token as any)?._id;       // whatever you store in your jwt() callback
    if (!id) return proceed(new Error("unauthorized"));
    socket.data.userId = String(id);
    proceed();
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);   // one private room per owner
  });

  const port = Number(process.env.PORT) || 3000;
  httpServer.listen(port, () => console.log(`http://localhost:${port}`));
});