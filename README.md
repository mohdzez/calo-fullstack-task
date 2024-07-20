# Calo Full Stack Task

## Description

This project is a full-stack application designed as a task for Calo. It includes:

- A backend service with endpoints for managing jobs.
- A frontend interface to create and display jobs.
- Simulation of delayed job execution by retrieving random images from Unsplash's food category.

## Table of Contents

- [Installation](#installation)
- [Technologies](#Technologies)

## Installation

- 1 Clone the repository
- 2 Open root directory
- 3 Open Docker
- 4 Run following commands One by one ( make sure your targeting root directory )
  - npm ci
  - docker-compose up
  - npm run ins_dep
  - npm run dev
- 5 The Client Should be live on ( http://localhost:5173 )

## TimeReport

Frontend ( 5 hours )

- Finalize and develop UI - 3 hours
- Integration with Backend - 2 hours
  - SSE setup - 2 hour
  - Consume API - 1 hour

Backend ( 5 hours)

- Basic GET/POST APIs - 1 hour
- fileSystem infrastructure - 1 hour
- SSE setup - 1 hour
- BullMQ Job Queues - 2 hours

Test And Minor Enhancements - 2 hours

Total Time : 12 hours ( 2 days part-time )

## Technologies

Frontend

- Vite React ( Typescript )
- Axios
- EventSource SSE
- Antd Design
- TailwindCSS
- React Scroll
- React Responsive Masonry

Backend

- Typescript
- Node.js -> ts-node
- Express
- Axios
- SSE
- BullMQ
- fs

Tools : VS code, Docker, React-Dev-Tools, Postman/ ThunderClient, ES-Lint, Prittier, Tabnine
