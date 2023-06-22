# Agent Configurator Tool

The _Agent Configuration Generator_ is an easy to use web interface for creating and editing agent configuration files. It targets the flow configuration format.

Try it out here: [grafana.github.io/agent-configurator/](https://grafana.github.io/agent-configurator/)

**This is an experimental tool and still in its early days!**. While we aim to support all agent components and are commited to adding support for new components, complete support will take some time.

## Core Features

Features marked as completed are currently present while the rest are still in development.

* [ ] Create a fresh agent configuration file using a guided configuration wizard
* [x] Update existing configurations by editing existing components or adding new ones
* [ ] Have [all components](https://grafana.com/docs/agent/latest/flow/reference/components/) configurable without writing code
* [x] Share configurations as URLs

## Target Audience

* First time agent users
  * Provide value by allowing _mix and match_ configuration without having to understand the configuration language
* Advanced users
  * Provide value by improving discoverability of components and configuration options
* Expert users
  * Provide value by sharing configurations using a single URL

# Setup

1. Run `npm install` to install all dependencies.
   * Due to incompatibilities in react dependencies, you will need to use `--force` to avoid a dependency conflict
2. Run `npm start` to start the server.
3. Access the config generator on [localhost:3000](localhost:3000).
