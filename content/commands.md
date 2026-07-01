---
id: commands
title: Reusable commands
description: "Common use commands day by day"
tags:
  - engineering
  - linux
draft: true
---

# Reusable commands

## Docker Postgres

docker run --name <IMAGE NAME> -p 5432:5432 -e POSTGRES_USER=<USER> -e POSTGRES_PASSWORD=<PASSWORD> -e POSTGRES_DB=<SCHEMA NAME> postgres:latest
