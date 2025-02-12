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

**Key Tools and Technologies:**

* TypeScript
* Prettier
* GitHub Actions
* Lit library
* Mocha
* Chai

---

##  Project Structure

```sh
└── room-summary-card/
    ├── .github
    │   ├── pull_request_template.md
    │   └── workflows
    │       ├── merge.yaml
    │       ├── pull_request.yaml
    │       └── push.yml
    ├── CONTRIBUTING.md
    ├── LICENSE
    ├── README.md
    ├── assets
    │   ├── climate.png
    │   ├── editor.png
    │   ├── icons.png
    │   ├── problems.png
    │   └── room-cards.png
    ├── hacs.json
    ├── mocha.setup.ts
    ├── package-lock.json
    ├── package.json
    ├── src
    │   ├── card.ts
    │   ├── common
    │   │   ├── action-handler.ts
    │   │   ├── feature.ts
    │   │   └── fire-event.ts
    │   ├── editor.ts
    │   ├── helpers.ts
    │   ├── index.ts
    │   ├── render.ts
    │   ├── styles.ts
    │   └── types
    │       ├── action.ts
    │       ├── config.ts
    │       ├── editor.ts
    │       ├── ha-form.ts
    │       └── homeassistant.ts
    ├── test
    │   ├── card.spec.ts
    │   ├── common
    │   │   ├── action-handler.spec.ts
    │   │   ├── feature.spec.ts
    │   │   └── fire-event.spec.ts
    │   ├── editor.spec.ts
    │   ├── helpers.spec.ts
    │   ├── index.spec.ts
    │   ├── renderers.spec.ts
    │   ├── styles.spec.ts
    │   └── test-helpers.ts
    ├── tsconfig.json
    └── tsconfig.test.json
```


###  Project Index
<details open>
	<summary><b><code>ROOM-SUMMARY-CARD/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/mocha.setup.ts'>mocha.setup.ts</a></b></td>
				<td>- Establishes a mock browser environment for testing purposes, allowing developers to simulate real-world interactions with custom cards and media queries<br>- The setup enables the project's test suite to run efficiently, ensuring accurate results and faster development cycles<br>- It provides a foundation for testing various scenarios, including card rendering and media query responsiveness.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/tsconfig.test.json'>tsconfig.test.json</a></b></td>
				<td>- Optimize project configuration by defining test and source file paths<br>- The tsconfig.test.json file extends the main tsconfig.json file, specifying compiler options such as types, module resolution, and target version<br>- It also includes and excludes specific files, ensuring a consistent build process across the entire codebase, which is part of a larger open-source project with multiple modules and test suites.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/package-lock.json'>package-lock.json</a></b></td>
				<td>- **Summary**

The `package-lock.json` file serves as the central configuration file for the `room-summary-card` project, which is a part of a larger codebase architecture<br>- This file ensures that all dependencies required by the project are properly locked in place, allowing for predictable and reproducible builds.

In essence, this code achieves the following:

* Establishes a clear dependency graph for the project
* Ensures consistency across different environments (e.g., development, production)
* Facilitates efficient package management and updates

By referencing the `package-lock.json` file, we can infer that the entire codebase architecture is centered around building and maintaining a robust and scalable web application, likely utilizing modern web technologies such as Lit and Parcel.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/package.json'>package.json</a></b></td>
				<td>- Summarizes the purpose of the room-summary-card package.

The room-summary-card package provides a custom card for Home Assistant that displays a summary of room entities<br>- It enables users to visualize key information about their rooms in a concise and easily digestible format, enhancing their overall home automation experience<br>- The package is designed to be modular and adaptable, allowing users to customize the display to suit their specific needs.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- Optimizes project configuration by setting compiler options for a TypeScript-based codebase<br>- Ensures compatibility with modern JavaScript features and enables strict type checking<br>- Configures module resolution, isolated modules, and experimental decorators to support complex project structures<br>- Facilitates efficient compilation and error reporting, allowing developers to focus on writing high-quality code.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/hacs.json'>hacs.json</a></b></td>
				<td>- Summarizes the Room Summary Card component, highlighting its purpose as a key visual representation of project data<br>- It enables users to quickly grasp essential information about rooms, such as occupancy rates and maintenance schedules<br>- The card's design facilitates easy navigation through the project structure, providing an intuitive overview of room details.</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- test Submodule -->
		<summary><b>test</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/index.spec.ts'>index.spec.ts</a></b></td>
				<td>- The provided test file showcases the functionality of the `index.ts` file within the project's architecture<br>- It demonstrates how the file registers custom elements with the browser, initializes and populates the `window.customCards` array, and handles multiple imports without duplicating registration<br>- The tests verify that the custom elements are registered correctly, and the `customCards` array is populated with the expected data.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/test-helpers.ts'>test-helpers.ts</a></b></td>
				<td>- Creates a reusable function `createStateEntity` that generates a mock state entity for testing purposes<br>- It constructs an object with domain, name, state, and attributes, providing methods to access these properties<br>- This utility helps simplify test setup by creating consistent, easily controllable entities for testing Home Assistant-related functionality, facilitating faster and more reliable testing cycles.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/editor.spec.ts'>editor.spec.ts</a></b></td>
				<td>- The test/editor.spec.ts file provides comprehensive testing coverage for the RoomSummaryCardEditor component, ensuring its functionality and behavior align with expected outcomes<br>- It validates initialization, configuration settings, rendering, and form behavior, providing a solid foundation for the component's overall architecture<br>- The tests verify correct data propagation, event dispatching, and computed label calculations, ultimately guaranteeing the editor's reliability and accuracy in displaying room summary information.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/renderers.spec.ts'>renderers.spec.ts</a></b></td>
				<td>- The test file rendersAreaStatistics achieves the functionality of displaying area statistics, such as device and entity counts, within a specified area<br>- It handles various scenarios, including areas with no devices or entities, entities belonging to devices without direct area IDs, and entities with missing device IDs<br>- The test ensures that the rendered HTML accurately reflects these conditions.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/styles.spec.ts'>styles.spec.ts</a></b></td>
				<td>- The test file `styles.spec.ts` validates the functionality of styles-related functions within the codebase architecture<br>- It ensures that various conditions are met when retrieving card styles and climate styles, as well as styling entity icons based on their states<br>- The tests cover different scenarios to guarantee accurate results for the entire codebase.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/helpers.spec.ts'>helpers.spec.ts</a></b></td>
				<td>- The test/helpers.spec.ts file serves as a comprehensive testing ground for the helpers module, ensuring its functionality and accuracy across various scenarios<br>- It validates the correctness of functions like getIconEntities, getProblemEntities, and getState, providing robust coverage for the entire codebase architecture<br>- The tests verify the module's ability to handle different configurations, edge cases, and entity types, ultimately guaranteeing a stable and reliable experience for users.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/card.spec.ts'>card.spec.ts</a></b></td>
				<td>- The test suite for the `RoomSummaryCard` component thoroughly covers its functionality, including configuration settings, rendering, and interaction with Home Assistant data<br>- It ensures that the card accurately displays room statistics, handles various scenarios, and provides a stable user experience<br>- The tests also validate the component's ability to adapt to different configurations and edge cases.</td>
			</tr>
			</table>
			<details>
				<summary><b>common</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/common/feature.spec.ts'>feature.spec.ts</a></b></td>
						<td>- The feature.spec.ts file validates the functionality of the feature function within the project's common module<br>- It tests various scenarios to ensure the function behaves correctly under different configurations and edge cases, including null or undefined config values, empty features lists, and case-sensitive feature names<br>- The test suite verifies that the feature function returns expected results based on the provided configuration and feature name.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/common/action-handler.spec.ts'>action-handler.spec.ts</a></b></td>
						<td>- The action-handler.spec.ts file tests the functionality of the actionHandler module, verifying that it correctly calls the directive function and dispatches a hass-action event with the correct configuration when an event is handled<br>- The test suite ensures that the handler behaves as expected in various scenarios, including successful event handling and no-change events.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/common/fire-event.spec.ts'>fire-event.spec.ts</a></b></td>
						<td>- The test file `fire-event.spec.ts` validates the functionality of the `fireEvent` function, which creates and dispatches custom events with various details<br>- The tests ensure that the function works correctly with different event types, detail objects, and targets (element or window)<br>- It verifies that the dispatched events are properly created and passed to the target's `dispatchEvent` method.</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- src Submodule -->
		<summary><b>src</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/helpers.ts'>helpers.ts</a></b></td>
				<td>- The provided file, `helpers.ts`, serves as a utility library for Home Assistant entities, states, and configurations<br>- It offers functions to create state icon elements, retrieve entity information, get problem entities in a specific area, and process entities with climate handling<br>- The code enables efficient management of Home Assistant data, streamlining interactions between entities and the user interface.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/editor.ts'>editor.ts</a></b></td>
				<td>- The RoomSummaryCardEditor class serves as the core component for editing room summary cards within the Home Assistant project<br>- It renders a form with predefined schema and updates the card configuration when values change, triggering a 'config-changed' event to notify other parts of the system<br>- The editor provides a user interface for configuring room features and area settings.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/styles.ts'>styles.ts</a></b></td>
				<td>- The Room Summary Card Styles Module provides dynamic styling logic and CSS definitions for the card layout, generating styles based on state and configuration<br>- It enables climate-specific styles and icons, as well as entity icon styles, to enhance user experience<br>- The module contributes to the overall project's architecture by providing a consistent design language for room summaries.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/card.ts'>card.ts</a></b></td>
				<td>- The RoomSummaryCard component displays a summary of room information in Home Assistant, showcasing state, climate information, and entity states in a grid layout with interactive elements<br>- It achieves this by rendering a card with various sections, including the room name, climate information, and state icons, while also indicating any problems that exist in the room.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/render.ts'>render.ts</a></b></td>
				<td>- The main purpose of the `render.ts` file is to generate dynamic content for a Home Assistant dashboard<br>- It provides two functions, `renderLabel` and `renderAreaStatistics`, which combine data from sensors and entities to display climate information and area statistics, respectively<br>- These functions are used to render templates that provide users with valuable insights into their home's environment.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/index.ts'>index.ts</a></b></td>
				<td>- Registers the Room Summary Card custom element with the browser and Home Assistant's custom card registry, making it available for use in dashboards<br>- Ensures compatibility by defining the customCards array on the window object<br>- Provides a unique identifier, display name, description, and documentation URL for the card, enabling users to easily discover and integrate the feature into their Home Assistant setup.</td>
			</tr>
			</table>
			<details>
				<summary><b>types</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/ha-form.ts'>ha-form.ts</a></b></td>
						<td>- Documenting the project structure reveals that the `ha-form.ts` file serves as a foundation for form schema definitions<br>- It establishes a set of reusable interfaces and types to describe various form elements, such as selectors and options<br>- The codebase architecture relies on this module to provide a standardized framework for building dynamic forms, enabling flexibility and maintainability across different components.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/editor.ts'>editor.ts</a></b></td>
						<td>- Exposes the ConfigChangedEvent interface, defining a type that represents an event triggered when configuration changes occur within the application<br>- The event carries a Config object as its payload, enabling the system to react to updates and maintain consistency across different components<br>- It plays a crucial role in handling configuration changes throughout the codebase architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/action.ts'>action.ts</a></b></td>
						<td>- The main purpose of the `action.ts` file is to define a unified set of types and interfaces for handling actions across the entire codebase architecture<br>- It establishes a foundation for action handlers, event interfaces, and configuration options, enabling a standardized approach to managing user interactions within the application<br>- This enables more efficient development and maintenance of the project's core functionality.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/homeassistant.ts'>homeassistant.ts</a></b></td>
						<td>- Defines the core structure of Home Assistant integration, providing a unified interface for entities, devices, states, and areas<br>- Establishes a common language for interacting with Home Assistant, enabling seamless data exchange between different components of the system<br>- Facilitates standardized access to entity attributes, device information, and area relationships, ultimately enhancing the overall functionality and maintainability of the project.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/config.ts'>config.ts</a></b></td>
						<td>- Defines the core configuration structure for card display and behavior within Home Assistant, encompassing entity settings, navigation paths, and feature options<br>- The Config interface serves as a central hub for entity-specific configurations, while the EntityConfig and Features types provide detailed information on individual entities and features to be enabled or disabled.</td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>common</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/common/action-handler.ts'>action-handler.ts</a></b></td>
						<td>- The action handler module enables custom click action handling for web components using the Lit library<br>- It manages action handlers for elements and supports features like double-click and hold actions<br>- The module creates a handler that processes click events and dispatches them as Home Assistant actions with the appropriate configuration, specifically designed to implement custom click action handling for Home Assistant entities.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/common/fire-event.ts'>fire-event.ts</a></b></td>
						<td>- Dispatches custom events for Home Assistant, enabling communication between components within the application<br>- It allows for event-driven programming and facilitates the exchange of data between different parts of the codebase<br>- The provided file is a key component in the overall architecture, providing a standardized way to handle events and interact with the application's UI.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/common/feature.ts'>feature.ts</a></b></td>
						<td>- The feature checker utility enables configuration management by verifying if specific features are enabled in a given configuration object<br>- It provides a fallback mechanism when the config is null/undefined, allowing it to return true for certain cases<br>- The code achieves this functionality, making it an essential component of the project's overall architecture.</td>
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
						<td>- The main purpose of this code file is to automate the process of releasing a new version of a project<br>- It checks for commits from authorized users, bumps the version number and creates a tag, generates release notes, and creates a GitHub release with a draft title based on the last PR title<br>- The script also updates the main branch with the release changes.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/.github/workflows/pull_request.yaml'>pull_request.yaml</a></b></td>
						<td>- The main purpose of the `pull_request.yaml` file is to automate a fast-forward check on pull requests<br>- It ensures that when a new merge request is opened, reopened, or synchronized, the workflow checks if it's a fast forward merge and posts a comment accordingly<br>- This helps maintain the integrity of the project by preventing unwanted changes from being merged.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/.github/workflows/merge.yaml'>merge.yaml</a></b></td>
						<td>- The merge.yaml file enables automated fast-forward merges on pull requests by triggering a workflow when an issue comment contains the "/merge" command and is associated with a pull request<br>- The workflow authenticates using a GitHub app token, then uses the Sequoia PGP fast-forward action to initiate the merge process.</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

<!-- prettier-ignore-end -->

## License

By contributing, you agree that your contributions will be licensed under the project's license.

Thank you for contributing!
