import { swagger } from "@elysiajs/swagger";

export default swagger({
  path: "/swagger.yml",
  documentation: {
    info: {
      title: "Fact Service",
      version: "1.0.0",
      description: "Fact Service API",
    },
  },
});
