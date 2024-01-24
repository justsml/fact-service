import swagger from "@elysiajs/swagger";

export const openApi = swagger({
  path: "/swagger.yml",
  documentation: {
    info: {
      title: "Fact Service",
      version: "1.0.0",
      description: "Fact Service API",
    },
  },
})