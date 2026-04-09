# TripKode Agents - Enterprise Frontend

**TripKode Agents Frontend** es la interfaz central de control y el **HUD de Simulación de Organizaciones Autónomas**. Esta aplicación permite gestionar fuerzas de trabajo digitales, supervisar pipelines agénticos en tiempo real y visualizar la colaboración en un entorno virtual 3D.

---

## Interfaz de Simulación y Control (Features)

### 1. Software Factory Dashboard
*   **Live Pipeline Streaming**: Visualización en tiempo real de logs y estados de ejecución mediante WebSockets.
*   **Artifact Explorer**: Previsualización instantánea de documentos generados (Notion/Markdown) integrada con `react-notion-x`.
*   **CodeSandbox Viewer**: Previsualización de código generado directamente en el dashboard.

### 2. Human-in-the-Loop (HITL) Terminal
*   **Decision Checkpoints**: Interfaz dedicada para la aprobación o rechazo de arquitecturas propuestas por la IA.
*   **Feedback Integration**: Canal directo para inyectar correcciones en el flujo de los agentes antes de proceder con el desarrollo.

### 3. Centro de Gobernanza Financiera
*   **GCloud Metrics HUD**: Visualización de costos reales de infraestructura y consumo de tokens de Vertex AI.
*   **Active Budget Monitoring**: Alertas visuales y estados de bloqueo basados en los límites configurados en el sistema de gobernanza.

### 4. Simulación 3D (Virtual Office)
*   **Claw3D SDK Integration**: Visualización de humanos y agentes interactuando en la oficina virtual.
*   **Real-time Presence**: Sincronización de presencia multi-usuario para equipos distribuidos.

---

## Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS 4 |
| **Autenticación** | NextAuth.js (v5 Beta) |
| **Iconografía** | Lucide React |
| **Renderizado Docs** | React Notion X |

---

## Guía de Configuración

1.  **Variables de Entorno**:
    Crea un archivo `.env.local` basado en `.env.example`:
    ```bash
    NEXT_PUBLIC_API_URL=http://localhost:8000 # URL del Backend FastAPI
    ```

2.  **Instalación**:
    ```bash
    npm install
    ```

3.  **Ejecución**:
    ```bash
    npm run dev
    ```

---

## Estructura del Aplicativo

*   `/dashboard`: Resumen ejecutivo de agentes y costos.
*   `/factory`: Monitor de ejecución y despliegue agéntico.
*   `/office`: Entorno de simulación 3D y colaboración.
*   `/metrics`: Análisis detallado de gobernanza y consumo.
*   `/workflows`: Diseño y visualización de jerarquías agénticas.

---
*Desarrollado por el equipo de TripKode Agentic Systems.*
