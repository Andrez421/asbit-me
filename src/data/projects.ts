export type I18n = string | { es: string; en: string };
export interface DiagramCol { t: I18n; n: I18n[] }
export interface Project { id: string; name: I18n; k: 'pro' | 'pers'; stk: string; d: { es: string; en: string }; cols: DiagramCol[] }

export const PROJECTS: Project[] = [
  {
    "id": "pgaa",
    "name": "PGAA",
    "k": "pro",
    "stk": "Next.js, TypeScript, Supabase, PostgreSQL, Redis, Docker",
    "d": {
      "es": "Plataforma para gestionar matrículas, validar documentos con IA, certificar y generar reportes de la operación diaria del centro: unos 12.000 aprendices. Control de acceso por roles y atributos con políticas de seguridad a nivel de fila (RLS) en todas las tablas, y un esquema pensado para crecer de uno a varios centros de formación.",
      "en": "Platform to manage enrollments, validate documents with AI, issue certifications and generate reports for the center daily operation: around 12,000 apprentices. Role- and attribute-based access control with row-level security (RLS) on every table, and a schema built to grow from one training center to many."
    },
    "cols": [
      {
        "t": {
          "es": "Interfaz",
          "en": "Interface"
        },
        "n": [
          "Next.js",
          "TypeScript"
        ]
      },
      {
        "t": {
          "es": "Reglas",
          "en": "Rules"
        },
        "n": [
          {
            "es": "Roles y atributos",
            "en": "Roles + attributes"
          },
          "CASL"
        ]
      },
      {
        "t": {
          "es": "Datos",
          "en": "Data"
        },
        "n": [
          "PostgreSQL",
          "Redis"
        ]
      },
      {
        "t": {
          "es": "Despliegue",
          "en": "Deploy"
        },
        "n": [
          "Docker",
          "Dokploy"
        ]
      }
    ]
  },
  {
    "id": "onbase",
    "name": "Robot SGDEA / OnBase",
    "k": "pro",
    "stk": "Python, Playwright",
    "d": {
      "es": "Automatiza el ingreso de documentos de aprendices a los expedientes electrónicos: el tiempo por documento cae de unos 3 minutos a unos 13 segundos (cerca de un 93 % menos) con un 100 % de efectividad, lo que equivale a 17 jornadas de trabajo manual por campaña, con reanudación por puntos de control y trazabilidad de cada carga.",
      "en": "Automates uploading apprentice documents into electronic case files: time per document drops from about 3 minutes to about 13 seconds (nearly 93% less) at 100% success, the equivalent of 17 working days of manual work per campaign, with checkpoint resume and a trace of every upload."
    },
    "cols": [
      {
        "t": {
          "es": "Entrada",
          "en": "Input"
        },
        "n": [
          "Excel",
          {
            "es": "Carpeta",
            "en": "Folder"
          }
        ]
      },
      {
        "t": "Robot",
        "n": [
          "Python",
          "Playwright"
        ]
      },
      {
        "t": {
          "es": "Destino",
          "en": "Target"
        },
        "n": [
          "OnBase / SGDEA"
        ]
      },
      {
        "t": {
          "es": "Control",
          "en": "Control"
        },
        "n": [
          {
            "es": "Puntos de control",
            "en": "Checkpoints"
          }
        ]
      }
    ]
  },
  {
    "id": "asistencia",
    "name": {
      "es": "Registro de Asistencia",
      "en": "Attendance Register"
    },
    "k": "pro",
    "stk": "Next.js, Prisma, PostgreSQL",
    "d": {
      "es": "Registro de asistencia con código QR y firma digital que elimina por completo los dos formatos en papel de ese proceso, con suite de pruebas automatizadas detrás.",
      "en": "Attendance tracking with QR codes and digital signatures that removes both paper forms from that process entirely, backed by an automated test suite."
    },
    "cols": [
      {
        "t": {
          "es": "Cliente",
          "en": "Client"
        },
        "n": [
          "Next.js",
          "QR"
        ]
      },
      {
        "t": {
          "es": "Servidor",
          "en": "Server"
        },
        "n": [
          "Prisma",
          {
            "es": "Firma digital",
            "en": "Digital signature"
          }
        ]
      },
      {
        "t": {
          "es": "Datos",
          "en": "Data"
        },
        "n": [
          "PostgreSQL"
        ]
      }
    ]
  },
  {
    "id": "cmdb",
    "name": "CMDB",
    "k": "pro",
    "stk": "Next.js, SQLite, Playwright",
    "d": {
      "es": "Inventario de activos tecnológicos de tres sedes, con alrededor de 1.000 equipos registrados y levantamiento automatizado por scripts en lugar de registro manual.",
      "en": "Technology asset inventory across three sites, with around 1,000 devices recorded and automated collection by scripts instead of manual entry."
    },
    "cols": [
      {
        "t": {
          "es": "Equipos",
          "en": "Devices"
        },
        "n": [
          {
            "es": "Scripts de inventario",
            "en": "Inventory scripts"
          }
        ]
      },
      {
        "t": "App",
        "n": [
          "Next.js"
        ]
      },
      {
        "t": {
          "es": "Datos",
          "en": "Data"
        },
        "n": [
          "SQLite"
        ]
      }
    ]
  },
  {
    "id": "gcly",
    "name": "GCly",
    "k": "pro",
    "stk": "tRPC, Drizzle ORM, Supabase",
    "d": {
      "es": "Plataforma SaaS multi-tenant para generar documentos oficiales con IA y firma digital PAdES con validez criptográfica.",
      "en": "Multi-tenant SaaS platform to generate official documents with AI and PAdES digital signatures with cryptographic validity."
    },
    "cols": [
      {
        "t": "App",
        "n": [
          {
            "es": "Aplicación web",
            "en": "Web app"
          }
        ]
      },
      {
        "t": "API",
        "n": [
          "tRPC",
          "Multi-tenant"
        ]
      },
      {
        "t": "IA",
        "n": [
          {
            "es": "Generación de documentos",
            "en": "Doc generation"
          }
        ]
      },
      {
        "t": {
          "es": "Datos",
          "en": "Data"
        },
        "n": [
          "Drizzle ORM",
          "Supabase"
        ]
      }
    ]
  },
  {
    "id": "aprendices",
    "name": {
      "es": "App de Aprendices",
      "en": "Apprentices App"
    },
    "k": "pro",
    "stk": "TypeScript, React, Firebase",
    "d": {
      "es": "Aplicación móvil para aprendices con recursos académicos, horarios y comunicados institucionales.",
      "en": "Mobile app for apprentices with academic resources, schedules and institutional announcements."
    },
    "cols": [
      {
        "t": "App",
        "n": [
          "TypeScript",
          "React"
        ]
      },
      {
        "t": {
          "es": "Servicios",
          "en": "Services"
        },
        "n": [
          "Firebase"
        ]
      }
    ]
  },
  {
    "id": "sirea",
    "name": "SIREA",
    "k": "pro",
    "stk": "Python, FastAPI, SQLAlchemy, Tkinter, PostgreSQL",
    "d": {
      "es": "Registro del uso de equipos en los ambientes de formación. Funciona sin internet y sincroniza sin duplicados: agente de escritorio en Windows, API, panel web y reportes en Excel.",
      "en": "Tracks computer usage in training rooms. Works offline and syncs without duplicates: a Windows desktop agent, an API, a web panel and Excel reports."
    },
    "cols": [
      {
        "t": {
          "es": "Campo",
          "en": "Field"
        },
        "n": [
          {
            "es": "Agente Windows",
            "en": "Windows agent"
          },
          "SQLite"
        ]
      },
      {
        "t": "API",
        "n": [
          "FastAPI",
          "SQLAlchemy"
        ]
      },
      {
        "t": {
          "es": "Datos",
          "en": "Data"
        },
        "n": [
          "PostgreSQL"
        ]
      },
      {
        "t": {
          "es": "Sin duplicados",
          "en": "No duplicates"
        },
        "n": [
          "UUID",
          {
            "es": "Sincronización",
            "en": "Sync"
          }
        ]
      }
    ]
  },
  {
    "id": "sirs",
    "name": "SIRS",
    "k": "pro",
    "stk": "React, TypeScript, Supabase, PostgreSQL",
    "d": {
      "es": "Documenta la infraestructura de red: sedes, centros de cableado, dispositivos, conexiones y transceivers, con búsqueda por IP, MAC, serial o ubicación y exportación a PDF, Excel y CSV.",
      "en": "Documents network infrastructure: sites, wiring centres, devices, links and transceivers, with search by IP, MAC, serial or location and export to PDF, Excel and CSV."
    },
    "cols": [
      {
        "t": {
          "es": "Entrada",
          "en": "Input"
        },
        "n": [
          {
            "es": "Inventario de red",
            "en": "Network inventory"
          }
        ]
      },
      {
        "t": "App",
        "n": [
          "React",
          "TypeScript"
        ]
      },
      {
        "t": {
          "es": "Datos",
          "en": "Data"
        },
        "n": [
          "Supabase",
          "PostgreSQL"
        ]
      },
      {
        "t": {
          "es": "Salida",
          "en": "Output"
        },
        "n": [
          "PDF",
          "Excel",
          "CSV"
        ]
      }
    ]
  },
  {
    "id": "chart",
    "name": "SENA Chart Studio",
    "k": "pro",
    "stk": "TypeScript, SVG, Playwright",
    "d": {
      "es": "Convierte el reporte PE-04 en gráficas editables para el informe institucional: más de 25 gráficas, comparación de periodos y exportación a PNG, SVG, CSV y ZIP. Procesa los reportes completos —decenas de miles de registros— dentro del navegador, sin servidor.",
      "en": "Turns the PE-04 report into editable charts for the institutional report: more than 25 charts, period comparison and export to PNG, SVG, CSV and ZIP. Processes the full reports — tens of thousands of rows — inside the browser, with no server."
    },
    "cols": [
      {
        "t": {
          "es": "Entrada",
          "en": "Input"
        },
        "n": [
          {
            "es": "Reporte PE-04",
            "en": "PE-04 report"
          }
        ]
      },
      {
        "t": {
          "es": "Gráficas",
          "en": "Charts"
        },
        "n": [
          {
            "es": "28 gráficas",
            "en": "28 charts"
          },
          "SVG"
        ]
      },
      {
        "t": {
          "es": "Salida",
          "en": "Output"
        },
        "n": [
          "PNG",
          "CSV",
          "ZIP"
        ]
      }
    ]
  },
  {
    "id": "gclyapp",
    "name": "GCly Mobile",
    "k": "pro",
    "stk": "Kotlin, Jetpack Compose, Supabase",
    "d": {
      "es": "App Android para registrar obligaciones contractuales, actividades y evidencia fotográfica sin conexión, con sincronización al recuperar la señal y verificación de las políticas de acceso contra el backend.",
      "en": "Android app to record contractual obligations, activities and photo evidence offline, syncing when the connection returns and verifying access policies against the backend."
    },
    "cols": [
      {
        "t": "App",
        "n": [
          "Kotlin",
          "Jetpack Compose"
        ]
      },
      {
        "t": {
          "es": "Modo",
          "en": "Mode"
        },
        "n": [
          {
            "es": "Sin conexión",
            "en": "Offline-first"
          }
        ]
      },
      {
        "t": {
          "es": "Datos",
          "en": "Data"
        },
        "n": [
          "Supabase"
        ]
      }
    ]
  },
  {
    "id": "n8n",
    "name": {
      "es": "Automatizaciones n8n",
      "en": "n8n automations"
    },
    "k": "pro",
    "stk": "n8n, LLM, MCP, OCR, Google Workspace",
    "d": {
      "es": "Flujos que validan los documentos de matrícula a un ritmo de 150 a 200 casos por día, escriben el estado en Google Sheets y avisan por correo las incidencias; más un agente que resuelve cuestionarios leyendo imágenes con OCR e IA a través de MCP.",
      "en": "Flows that validate enrollment documents at 150 to 200 cases per day, write the status into Google Sheets and email the findings; plus an agent that answers questionnaires by reading images with OCR and AI over MCP."
    },
    "cols": [
      {
        "t": {
          "es": "Disparador",
          "en": "Trigger"
        },
        "n": [
          "Google Drive"
        ]
      },
      {
        "t": {
          "es": "Lectura",
          "en": "Reading"
        },
        "n": [
          "OCR"
        ]
      },
      {
        "t": "IA",
        "n": [
          "LLM",
          "MCP"
        ]
      },
      {
        "t": {
          "es": "Salida",
          "en": "Output"
        },
        "n": [
          "Sheets",
          "Gmail"
        ]
      }
    ]
  },
  {
    "id": "exogena",
    "name": {
      "es": "Generador Exógena",
      "en": "Exogenous Generator"
    },
    "k": "pers",
    "stk": "Python, FastAPI, SQLite",
    "d": {
      "es": "Genera y valida los reportes de información exógena que exige la DIAN: extracción de datos, validación y formato oficial.",
      "en": "Generates and validates the exogenous information reports required by the DIAN: data extraction, validation and official format."
    },
    "cols": [
      {
        "t": {
          "es": "Fuente",
          "en": "Source"
        },
        "n": [
          {
            "es": "Datos contables",
            "en": "Accounting data"
          }
        ]
      },
      {
        "t": {
          "es": "Proceso",
          "en": "Process"
        },
        "n": [
          "Python",
          "FastAPI"
        ]
      },
      {
        "t": {
          "es": "Salida",
          "en": "Output"
        },
        "n": [
          {
            "es": "Formato DIAN",
            "en": "DIAN format"
          }
        ]
      }
    ]
  },
  {
    "id": "secopia",
    "name": "Secopia",
    "k": "pers",
    "stk": "Next.js, TypeScript, Typesense, Redis, Docker",
    "d": {
      "es": "Buscador de contratación pública: consulta los datos abiertos de SECOP I y II sin registro ni CAPTCHA, con más de cinco millones de contratos y búsqueda instantánea sobre índice propio.",
      "en": "Public procurement search: queries Colombia open SECOP I and II data with no signup or CAPTCHA, over five million contracts and instant search on its own index."
    },
    "cols": [
      {
        "t": {
          "es": "Entrada",
          "en": "Input"
        },
        "n": [
          {
            "es": "Datos sensibles",
            "en": "Sensitive data"
          }
        ]
      },
      {
        "t": {
          "es": "Núcleo",
          "en": "Core"
        },
        "n": [
          {
            "es": "Cifrado",
            "en": "Encryption"
          },
          {
            "es": "Control de acceso",
            "en": "Access control"
          }
        ]
      },
      {
        "t": {
          "es": "Respaldo",
          "en": "Backup"
        },
        "n": [
          {
            "es": "Copias seguras",
            "en": "Secure copies"
          }
        ]
      }
    ]
  },
  {
    "id": "mcp",
    "name": "MCP Secopia",
    "k": "pers",
    "stk": "TypeScript, Node.js, Python",
    "d": {
      "es": "Conecta modelos de IA con el backend de Secopia mediante Model Context Protocol.",
      "en": "Connects AI models to the Secopia backend through Model Context Protocol."
    },
    "cols": [
      {
        "t": {
          "es": "Modelo",
          "en": "Model"
        },
        "n": [
          {
            "es": "Modelo de IA",
            "en": "AI model"
          }
        ]
      },
      {
        "t": "MCP",
        "n": [
          "TypeScript",
          "Node.js"
        ]
      },
      {
        "t": "Secopia",
        "n": [
          "Backend"
        ]
      }
    ]
  }
];
