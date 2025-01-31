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

## Features

|      | Feature         | Summary       |
| :--- | :---:           | :---          |
| ⚙️  | **Architecture**  | <ul><li>Modular design with separate modules for helpers, styles, action handler, card, and types.</li><li>Utilizes Home Assistant integration for data fetching and rendering.</li><li>Employes Lit library for web component development.</li></ul> |
| 🔩 | **Code Quality**  | <ul><li>Adheres to TypeScript as the primary language.</li><li>Uses Prettier for code formatting and organization.</li><li>Enforces strict mode, isolated modules, and experimental decorators in tsconfig.json.</li></ul> |
| 📄 | **Documentation** | <ul><li>Maintains a comprehensive documentation section with usage commands, test commands, and install commands.</li><li>Provides detailed information on dependencies, including package-lock.json and package.json.</li><li>Includes links to external tools and technologies used in the project.</li></ul> |
| 🔌 | **Integrations**  | <ul><li>Integrates with Home Assistant for data fetching and rendering.</li><li>Utilizes dependencies like Lit, fast-deep-equal, and parcel for web component development.</li><li>Supports automated workflows using GitHub Actions.</li></ul> |
| 🧩 | **Modularity**    | <ul><li>Separates modules for helpers, styles, action handler, card, and types to improve maintainability.</li><li>Enforces a consistent coding style throughout the project.</li><li>Utilizes modular dependencies to reduce coupling between components.</li></ul> |
| 🧪 | **Testing**       | <ul><li>Automates testing using GitHub Actions workflows.</li><li>Includes automated fast-forward checks on pull requests using pull_request.yaml.</li><li>Enforces code integrity and stability through automated deployment and versioning.</li></ul> |
| ⚡️  | **Performance**   | <ul><li>Optimizes performance by utilizing efficient data fetching mechanisms.</li><li>Employes caching to reduce unnecessary requests to Home Assistant.</li><li>Enforces strict mode in tsconfig.json for improved compilation efficiency.</li></ul> |
| 🛡️ | **Security**      | <ul><li>Ensures secure deployment and versioning through automated workflows.</li><li>Utilizes GitHub Actions for secure code signing and verification.</li><li>Enforces strict mode in tsconfig.json to prevent potential security vulnerabilities.</li></ul> |
| 📦 | **Dependencies**  | <ul><li>Maintains a clear record of dependencies using package-lock.json and package.json.</li><li>Utilizes dependencies like npm, hacs.json, and TypeScript for project management.</li><li>Enforces consistent versioning across the project.</li></ul> |

---

## Project Structure

```sh
└── room-summary-card/
    ├── .github
    │   ├── pull_request_template.md
    │   └── workflows
    │       ├── merge.yaml
    │       ├── pull_request.yaml
    │       └── push.yml
    ├── README.md
    ├── hacs.json
    ├── package-lock.json
    ├── package.json
    ├── src
    │   ├── action-handler.ts
    │   ├── card.ts
    │   ├── helpers.ts
    │   ├── index.ts
    │   ├── styles.ts
    │   └── types
    │       ├── config.ts
    │       ├── homeassistant.ts
    │       └── index.ts
    └── tsconfig.json
```


### 📂 Project Index
<details open>
	<summary><b><code>ROOM-SUMMARY-CARD/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/package-lock.json'>package-lock.json</a></b></td>
				<td>**Summary**

The `package-lock.json` file serves as a crucial component of the project's overall architecture, specifically in regards to dependency management and version control.

In essence, this code achieves the following:

* Defines the dependencies required by the `room-summary-card` package, ensuring that all necessary libraries are installed and up-to-date.
* Provides a clear record of the project's dependencies, making it easier to manage and maintain the overall codebase.
* Ensures consistency in versioning across the project, allowing for predictable behavior and minimizing potential conflicts.

By referencing this file, developers can quickly understand the project's dependency landscape and make informed decisions about updates or changes to the codebase.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/package.json'>package.json</a></b></td>
				<td>- The room-summary-card package provides a custom Home Assistant card that displays a summary of room entities<br>- It achieves this by aggregating and visualizing data from various sources, ultimately enhancing the user experience<br>- By integrating with Home Assistant and leveraging dependencies like Lit and fast-deep-equal, the package enables users to gain valuable insights into their rooms.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- The tsconfig.json file serves as the foundation for the project's compiler settings, defining the target JavaScript version and module resolution strategy<br>- It enables strict mode, isolated modules, and experimental decorators to ensure a robust and maintainable codebase<br>- By setting these options, the file achieves a consistent and efficient build process, laying the groundwork for the entire codebase architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/hacs.json'>hacs.json</a></b></td>
				<td>- Summarizes the Room Summary Card component, highlighting its purpose as a key visual representation of room data within the project's architecture<br>- It enables users to quickly grasp essential information about each room, facilitating navigation and decision-making throughout the application<br>- The component is integral to the overall user experience, providing a concise and engaging way to present critical data.</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- src Submodule -->
		<summary><b>src</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/helpers.ts'>helpers.ts</a></b></td>
				<td>- The main purpose of the `helpers.ts` file is to provide a set of utility functions for working with Home Assistant entities, states, and configurations<br>- These functions handle entity management, state retrieval, and UI element creation, enabling efficient interaction with the Home Assistant system<br>- The code achieves this by providing a collection of helper functions that simplify tasks such as creating state icons, retrieving entity information, and processing configuration data.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/styles.ts'>styles.ts</a></b></td>
				<td>- The Room Summary Card Styles Module generates dynamic styles based on state and sensor readings, providing a climate-specific styling experience<br>- It achieves this by calculating border styles based on temperature and humidity thresholds, generating style maps for icons, containers, and text, and defining static CSS styles for the card layout and elements.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/action-handler.ts'>action-handler.ts</a></b></td>
				<td>- The action handler module enables custom click action handling for web components using the Lit library<br>- It creates a global action handler element that processes click events and dispatches them as Home Assistant actions with specified configuration, supporting features like double-click and hold actions<br>- The module is designed to be used by consumers of this project, providing a directive that manages the lifecycle of action handling for elements.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/card.ts'>card.ts</a></b></td>
				<td>- The RoomSummaryCard component displays a summary of room information in Home Assistant, showcasing state, climate data, and entity states in a grid layout with interactive elements<br>- It fetches data from Home Assistant's state and entities, rendering a card that provides an overview of the room's status and statistics<br>- The component is designed to be customizable through its configuration object.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/index.ts'>index.ts</a></b></td>
				<td>- Registers the Room Summary Card custom element with the browser and Home Assistant's custom card registry, making it available for use in Home Assistant dashboards<br>- The module ensures compatibility and provides a unique identifier, display name, and description for the card, enabling users to easily discover and utilize this feature within the platform.</td>
			</tr>
			</table>
			<details>
				<summary><b>types</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/homeassistant.ts'>homeassistant.ts</a></b></td>
						<td>- Defines the core structure of Home Assistant integration, providing a unified interface for entities, devices, states, and areas<br>- Establishes a common language for interacting with Home Assistant, enabling seamless data exchange between different components of the system<br>- Facilitates standardized access to entity attributes, device information, and area relationships, ultimately enhancing the overall functionality and maintainability of the project.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/index.ts'>index.ts</a></b></td>
						<td>- Defines core type definitions and action handlers for the project's architecture, extending the global window interface to include a custom cards array<br>- Establishes interfaces for action handler events, HTML elements, and configuration options, enabling the integration of custom card functionality with Home Assistant DOM events<br>- Provides a foundation for handling various actions, such as hold, tap, and double-tap events.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/config.ts'>config.ts</a></b></td>
						<td>- The main purpose of the `config.ts` file is to define core type definitions for card configuration within the Home Assistant project<br>- It establishes a unified structure for entity display and behavior, providing a foundation for integrating various components and features<br>- The file's exports enable flexible configuration options, enabling users to customize their experience with precision.</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- .github Submodule -->
		<summary><b>.github</b></summary>
		<blockquote>
			<details>
				<summary><b>workflows</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/.github/workflows/push.yml'>push.yml</a></b></td>
						<td>- The provided YAML file orchestrates the deployment of a new version by automating the bumping process, creating tags and packages, and updating the main branch with release changes<br>- It ensures that only authorized users can push code to the repository, checks the commit author's email address, and updates the version number accordingly<br>- The workflow also generates release notes and creates a new tag for the released version.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/.github/workflows/pull_request.yaml'>pull_request.yaml</a></b></td>
						<td>- The main purpose of the `pull_request.yaml` file is to automate a fast-forward check on pull requests<br>- It ensures that when a new merge commit is created, it doesn't introduce changes from another branch, preventing potential conflicts and ensuring code integrity<br>- This workflow helps maintain the project's stability and prevents unwanted changes from being merged into the main branch.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/.github/workflows/merge.yaml'>merge.yaml</a></b></td>
						<td>- The merge.yaml file enables automated fast-forward merges on pull requests by triggering a workflow when an issue comment contains the '/merge' command<br>- It utilizes a GitHub app token and the sequoia-pgp/fast-forward action to streamline the process, reducing verbosity and minimizing errors<br>- This automation enhances project efficiency and reduces manual intervention.</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>


## License

By contributing, you agree that your contributions will be licensed under the project's license.

Thank you for contributing!