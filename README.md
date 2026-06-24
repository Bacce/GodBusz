# 🚌 GödBusz

GödBusz is a real-time bus tracking and routing application designed to provide live updates and route information for buses in the city Göd.

The application build on the backend of the Molteam Göd bus application. My intention to improve the UX and design of the application.

https://god.molteam.hu/

## AI

Initially this started as an experimenting with AI assisted coding. I used gemma4:31b to build most of the features, and as a last round, I ran Claude Opus 4.6 to clean up and give improvement suggestions.

TODO: Add Medium article link

## ✨ Features
- **Real-time Tracking**: Monitor the live positions of buses on an interactive map.
- **Route Information**: View detailed bus routes and schedules.
- **Stop Locator**: Easily find and locate bus stops.
- **Intelligent Routing**: Integrated routing proxy powered by OSRM for efficient pathfinding.
- **Interactive Map**: Built with Leaflet for a smooth, responsive geographic interface.
- **Dynamic Popups**: Contextual information about stops and routes via interactive markers.

## Design

I tried to follow the design language of the Budapest Go webapplication.

## Map

While the original molteam application uses OpenStreetMap, I found the default map of theirs not perfectly adequate for the job, so I created my own take. It is not included in the git repository, if you want to run it locally, you can uncomment the TileLayer component in the client application to change back to the original map.
The deployed map is created with Maperitive from the OSM data, only the style is changed over the city.
Fun fact, if you look around other cities around Göd in the application, you can see those remain the default OSM with individual buildings drawn.
I will go into detail in the planned Medium article.

## 📂 Project Structure

```text
GödBusz/
├── client/                # Frontend application (React + Vite)
│   ├── src/               # React components and logic
│   ├── public/            # Static assets
│   └── Dockerfile         # Client container configuration
├── server/                # Backend API (Node.js + Express)
│   ├── src/               # API routes, services, and middleware
│   ├── public/            # Server-side static files
│   └── Dockerfile         # Server container configuration
├── build-client.sh        # Script to build the client docker image
└── build-serve.sh         # Script to build the server docker image
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/)
- Docker (Optional, for containerized deployment)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/godbusz.git
   cd godbusz
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The server will start on `http://localhost:3000`.

3. **Setup Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The client will start on `http://localhost:5173` (default Vite port).

## 🐳 Deployment

The project is containerized using Docker. You can build and run the services using the provided Dockerfiles in the `client` and `server` directories.

Example build scripts available in the root:
- `./build-client.sh`
- `./build-serve.sh`

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

## Contribution

Any contribution is welcomed as long as it is not AI slop, feel free to create PR's.
