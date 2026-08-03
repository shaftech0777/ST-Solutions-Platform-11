import app from "./app.js";
import { config } from "./config/index.js";

const port = config.port;

const server = app.listen(port, () => {
  console.log(`ST-Solutions API running on port ${port}`);
});

export default server;
