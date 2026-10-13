export type I18n = string | { es: string; en: string };
export const SNIPS: string[] = [
  "-- acceso por centro de formación\nalter table matricula enable row level security;\n\ncreate policy centro_lee_matricula\n  on matricula for select\n  using (centro_id = (auth.jwt() ->> 'centro_id')::int);",
  "services:\n  web:\n    image: ghcr.io/org/app:${TAG}\n    restart: unless-stopped\n    labels:\n      - traefik.enable=true\n      - traefik.http.routers.app.tls=true",
  "on:\n  pull_request:\n  push: { branches: [main] }\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: pnpm install --frozen-lockfile\n      - run: pnpm test",
  "export const matricula = router({\n  listar: protectedProcedure\n    .input(z.object({ ficha: z.string() }))\n    .query(({ ctx, input }) =>\n      ctx.db.matricula.findMany({\n        where: { ficha: input.ficha },\n      })),\n});",
  "for aprendiz in pendientes(excel):\n    try:\n        cargar_documentos(page, aprendiz)\n        checkpoint.marcar(aprendiz.id, \"ok\")\n    except TimeoutError:\n        checkpoint.marcar(aprendiz.id, \"reintentar\")",
  "\"acls\": [\n  {\n    \"action\": \"accept\",\n    \"src\": [\"tag:dev\"],\n    \"dst\": [\"tag:staging:22,443\"]\n  }\n]",
  "docker service update \\\n  --image app:$SHA \\\n  --update-order start-first \\\n  --update-failure-action rollback \\\n  app_web",
  "const { can, build } = new AbilityBuilder(createMongoAbility);\nif (user.rol === \"admin\") can(\"manage\", \"all\");\nelse can(\"read\", \"Matricula\", { centroId: user.centroId });\nexport const ability = build();"
];
