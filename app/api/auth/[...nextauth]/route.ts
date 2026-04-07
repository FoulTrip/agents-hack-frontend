// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // Asumiendo que el alias @ apunta a la raíz
export const { GET, POST } = handlers;
