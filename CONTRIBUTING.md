# Contributing Guidelines

Thank you for your interest in contributing to the project! I welcome contributions from the community and am pleased that you are interested in helping me make this project better.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker to avoid duplicates. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and what behavior you expected to see
- Include screenshots if applicable
- Include details about your configuration and environment

### Suggesting Enhancements

If you have a suggestion for improving the project, we'd love to hear it. Please provide:

- A clear and detailed explanation of the feature
- The motivation behind the suggestion
- Any potential alternatives you've considered
- Examples of how this enhancement would be used

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run any tests and linting tools
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style and conventions
- Update documentation as needed
- Add tests for new features
- Keep commits focused and atomic
- Write clear, descriptive commit messages
- Reference any relevant issues

## Development Setup

### Prerequisites

Before getting started with room-summary-card, ensure your runtime environment meets the following requirements:

- **Programming Language:** TypeScript
- **Package Manager:** Npm

### Installation

Install room-summary-card using one of the following methods:

**Build from source:**

1. Clone the room-summary-card repository:

```sh
❯ git clone https://github.com/homeassistant-extras/room-summary-card
```

2. Navigate to the project directory:

```sh
❯ cd room-summary-card
```

3. Install the project dependencies:

**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```

### Usage

Run parcel using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm run watch
```

Or to do a single build

```sh
❯ npm run build
```

## Documentation

- Keep READMEs and other documentation up to date
- Use clear, concise language
- Include examples where appropriate
- Document any new features or changes in behavior

## Questions?

If you have any questions, please feel free to:

- Open an issue with the question label
- Contact me here on GitHub

<!-- prettier-ignore-start -->

##  Features

| Feature         | Summary       |
| :---:           | :---          |
| **Architecture**  | <ul><li>Modular development with a focus on isolation of modules.</li><li>Emphasis on building a suite of web components.</li><li>Centered around Home Assistant's architecture and integration.</li></ul> |
| 🔩 **Code Quality**  | <ul><li>Follows strict coding standards and adheres to modern JavaScript features.</li><li>Utilizes tools like Prettier for code formatting and organization.</li><li>Maintains a consistent coding style throughout the project.</li></ul> |
| 📄 **Documentation** | <ul><li>Provides detailed documentation on the project's architecture, components, and usage.</li><li>Includes links to relevant GitHub pages and repositories.</li><li>Maintains a clear and concise writing style for easy understanding.</li></ul> |
| 🔌 **Integrations**  | <ul><li>Integrates with Home Assistant's custom card registry and Lit library for web component development.</li><li>Utilizes GitHub Actions workflows for automation and deployment.</li><li>Maintains compatibility with various browsers and environments.</li></ul> |
| 🧩 **Modularity**    | <ul><li>Emphasizes modular development to facilitate easy maintenance and updates.</li><li>Provides a clear separation of concerns between components and features.</li><li>Maintains a consistent structure throughout the project.</li></ul> |
| 🧪 **Testing**       | <ul><li>Utilizes Mocha, Chai, and Sinon for testing and debugging purposes.</li><li>Maintains comprehensive test suites for various components and features.</li><li>Ensures coverage of edge cases and scenarios.</li></ul> |
| ⚡️ **Performance**   | <ul><li>Optimizes project configuration for performance and compilation.</li><li>Utilizes TypeScript and Prettier for efficient code maintenance.</li><li>Maintains a focus on data integrity and accuracy.</li></ul> |
| 🛡️ **Security**      | <ul><li>Emphasizes security through the use of GitHub Actions workflows and authentication tokens.</li><li>Maintains compatibility with various browsers and environments.</li><li>Ensures secure communication between components and features.</li></ul> |
| 📦 **Dependencies**  | <ul><li>Maintains a clear dependency graph using `package-lock.json` and `npm`.</li><li>Utilizes tools like `hacs.json` for efficient package management.</li><li>Maintains compatibility with various browsers and environments.</li></ul> |
| 🚀 **Scalability**   | <ul><li>Emphasizes scalability through modular development and efficient testing.</li><li>Maintains a focus on data integrity and accuracy.</li><li>Ensures seamless integration with Home Assistant's architecture and integration.</li></ul>

<!-- prettier-ignore-end -->

**Key Tools and Technologies:**

- TypeScript
- Prettier
- GitHub Actions
- Lit library
- Mocha
- Chai

## License

By contributing, you agree that your contributions will be licensed under the project's license.

Thank you for contributing!
