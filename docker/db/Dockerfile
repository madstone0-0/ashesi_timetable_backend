FROM postgres

EXPOSE 5432

COPY ./src/db/migrations/*.sql /docker-entrypoint-initdb.d/
