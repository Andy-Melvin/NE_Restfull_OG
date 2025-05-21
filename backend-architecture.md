```mermaid
graph TB
    subgraph Backend["Backend Architecture"]
        Server["Server (server.ts)"] --> Routes
        Server --> Middlewares
        Server --> Controllers
        Server --> Utils
        Server --> Types
        Server --> Lib
        Server --> Schema
        Server --> Templates
        Server --> Exceptions

        subgraph Routes["Routes Layer"]
            Routes --> Controllers
        end

        subgraph Middlewares["Middleware Layer"]
            Middlewares --> AuthMiddleware
            Middlewares --> ValidationMiddleware
            Middlewares --> ErrorMiddleware
        end

        subgraph Controllers["Controllers Layer"]
            Controllers --> Services
            Controllers --> Models
        end

        subgraph Utils["Utils Layer"]
            Utils --> Helpers
            Utils --> Constants
        end

        subgraph Types["Types Layer"]
            Types --> Interfaces
            Types --> Enums
        end

        subgraph Lib["Library Layer"]
            Lib --> Database
            Lib --> ExternalServices
        end

        subgraph Schema["Schema Layer"]
            Schema --> ValidationSchemas
        end

        subgraph Templates["Templates Layer"]
            Templates --> EmailTemplates
        end

        subgraph Exceptions["Exceptions Layer"]
            Exceptions --> CustomExceptions
        end
    end

    style Backend fill:#f9f,stroke:#333,stroke-width:2px
    style Server fill:#bbf,stroke:#333,stroke-width:2px
    style Routes fill:#dfd,stroke:#333,stroke-width:2px
    style Middlewares fill:#dfd,stroke:#333,stroke-width:2px
    style Controllers fill:#dfd,stroke:#333,stroke-width:2px
    style Utils fill:#dfd,stroke:#333,stroke-width:2px
    style Types fill:#dfd,stroke:#333,stroke-width:2px
    style Lib fill:#dfd,stroke:#333,stroke-width:2px
    style Schema fill:#dfd,stroke:#333,stroke-width:2px
    style Templates fill:#dfd,stroke:#333,stroke-width:2px
    style Exceptions fill:#dfd,stroke:#333,stroke-width:2px
``` 