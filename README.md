#  Reformas y Casas Modulares – Proyecto Full Stack

Proyecto realizado como **trabajo de clase** para demostrar el uso de **Front-end + Back-end**, creando una **API REST** y conectándola con una web estática.

El objetivo principal es simular una **empresa de reformas y casas modulares**, permitiendo:
- Consultar modelos de casas
- Elegir materiales y extras
- Calcular un presupuesto aproximado
- Guardar solicitudes de clientes

---

##  Autor
**Nombre:** Francisco Javier Rodríguez Suárez  
**Ciclo:** Desarrollo de Aplicaciones Web DUAL (DAW DUAL)  
**Centro:** IES de Teis

---

##  Descripción del proyecto

Este proyecto está dividido en dos partes:

###  Front-end
- Web corporativa con varias páginas HTML
- Diseño moderno y responsive
- Simulación de una empresa real
- Preparada para consumir datos desde una API REST
- **Validación avanzada de formularios** (email, teléfono y presupuesto)
###  Back-end
- API REST desarrollada en **Python con FastAPI**
- Endpoints para:
  - Modelos de casas modulares
  - Opciones y materiales
  - Cálculo de presupuestos
  - Gestión de solicitudes de clientes
- Documentación automática con **Swagger**

---

##  Tecnologías utilizadas

### Front-end
- HTML5 semántico
- CSS3 (estilos unificados y variables)
- Live Server (desarrollo local)

### Back-end
- Python 3
- FastAPI
- Uvicorn
- Swagger UI (OpenAPI)

### Control de versiones
- Git
- GitHub

---

## Estructura del proyecto

<pre>
/frontend
 ├── index.html
 ├── reformas.html
 ├── casas-modulares.html
 ├── contacto.html
 └── estilos-unificado.css

/backend
 └── main.py
</pre>





---

##  Cómo ejecutar el proyecto

### Backend (API)

1. Abrir el proyecto en **PyCharm**
2. Ejecutar el servidor con:
   ```bash
   uvicorn main:app --reload

3. La API estará disponible en: http://127.0.0.1:8000
4. Documentación Swagger: http://127.0.0.1:8000/docs

### Front-end
1. Abrir la carpeta del front-end en Visual Studio Code
2. Usar Live Server
3. Acceder desde el navegador a: http://127.0.0.1:5500/index.html


## Endpoints principales de la API

| Método | Endpoint                      | Descripción                                        |
| ------ | ----------------------------- | -------------------------------------------------- |
| GET    | `/health`                     | Comprobación de estado de la API                   |
| GET    | `/models`                     | Listado de modelos de casas modulares              |
| GET    | `/options`                    | Listado de materiales y extras disponibles         |
| POST   | `/configurations/calculate`   | Cálculo de presupuesto a partir de modelo y extras |
| POST   | `/configurations`             | Crear y guardar una configuración de presupuesto   |
| GET    | `/configurations`             | Listar todas las configuraciones guardadas         |
| GET    | `/configurations/{config_id}` | Obtener una configuración concreta por ID          |
| GET    | `/leads`                      | Listar solicitudes de contacto (leads)             |
| POST   | `/leads`                      | Crear una nueva solicitud de contacto              |
| GET    | `/`                           | Endpoint raíz de la API                            |

La documentación completa de la API se genera automáticamente mediante Swagger y está disponible en `/docs`.



## Objetivos cumplidos

-Uso de Front-end y Back-end
-API REST propia
-Consumo de API desde JavaScript
-Validación avanzada de formularios
-Documentación con Swagger
-Simulación de proyecto real
-Aprendizaje progresivo paso a paso  

## Notas finales:
Este proyecto está enfocado a aprendizaje, no a producción.
Todo el desarrollo se ha realizado paso a paso, entendiendo cada parte del proceso.