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
    │       ├── homeassistant.ts
    │       └── index.ts
    ├── test
    │   ├── action-handler.spec.ts
    │   ├── card.spec.ts
    │   ├── editor.spec.ts
    │   ├── fire-event.spec.ts
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
				<td>- Establishes a mock browser environment for testing purposes, allowing developers to simulate real-world interactions with custom cards and media queries<br>- Enables the use of `customCards` and `matchMedia` in tests, providing a consistent and controlled setting for development and debugging<br>- Facilitates seamless integration of frontend code with backend applications, ensuring accurate and reliable test results.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/tsconfig.test.json'>tsconfig.test.json</a></b></td>
				<td>- Optimize project configuration for testing and development<br>- The tsconfig.test.json file extends the base configuration from tsconfig.json, setting up the compiler options to support testing frameworks like Mocha, Chai, and Sinon<br>- It also specifies the target JavaScript version and enables commonJS module resolution<br>- This configuration ensures a consistent build process across the project's test and source code directories.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/package-lock.json'>package-lock.json</a></b></td>
				<td>- **Summary**

The `package-lock.json` file serves as the central configuration file for the `room-summary-card` project, which is a part of a larger codebase architecture<br>- This file ensures that all dependencies required by the project are properly locked and managed.

In essence, this file achieves the following:

* Provides a clear dependency graph for the project
* Ensures consistency across different environments (e.g., development, production)
* Facilitates efficient updates and maintenance of the project's dependencies

By referencing the `package-lock.json` file, we can infer that the entire codebase architecture is centered around building and maintaining a suite of web components, with a focus on open-source best practices<br>- The presence of tools like `@open-wc/testing` suggests a commitment to testing and quality assurance, while the use of `lit` and `fast-deep-equal` implies a focus on performance and data integrity.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/package.json'>package.json</a></b></td>
				<td>- Summarizes the purpose of the room-summary-card package.

The room-summary-card package provides a custom card component for Home Assistant that displays a summary of room entities<br>- It enables users to visualize and manage their room data in a user-friendly interface, enhancing the overall Home Assistant experience<br>- The package is designed to be modular and adaptable, allowing users to easily integrate it into their existing setup.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- Optimizes project configuration by defining compiler options for the TypeScript compiler<br>- Ensures compatibility with modern JavaScript features and adheres to strict coding standards<br>- Aligns with the project's overall architecture, which emphasizes modular development and isolation of modules<br>- Facilitates efficient compilation and error handling, ultimately contributing to a stable and maintainable codebase.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/hacs.json'>hacs.json</a></b></td>
				<td>- Summarizes the Room Summary Card file<br>- The card provides a high-level overview of room data, enabling users to quickly grasp key information at a glance<br>- It serves as a crucial component in the project's architecture, facilitating easy access and understanding of room details<br>- By rendering a README, it also supports user documentation and onboarding processes.</td>
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
				<td>- The provided test file showcases the functionality of the `index.ts` file within the project's architecture<br>- It demonstrates how the code registers custom elements, initializes and populates the `window.customCards` array, and handles multiple imports without duplicating registration<br>- The tests verify that the code achieves its intended purpose, ensuring a robust and reliable implementation.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/test-helpers.ts'>test-helpers.ts</a></b></td>
				<td>- Creates a reusable function `createStateEntity` that generates a mock state entity for testing purposes<br>- It constructs an object with domain, name, and initial state, allowing for easy creation of entities with customizable attributes<br>- This utility enables efficient setup of test data, facilitating comprehensive testing of the home assistant project's functionality.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/editor.spec.ts'>editor.spec.ts</a></b></td>
				<td>- The provided test file editor.spec.ts serves as a comprehensive testing framework for the RoomSummaryCardEditor component, ensuring its functionality and behavior align with project requirements<br>- It covers initialization, configuration, rendering, and form behavior, providing a robust foundation for the entire codebase architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/action-handler.spec.ts'>action-handler.spec.ts</a></b></td>
				<td>- The test suite for the action handler module ensures that the `handleClickAction` function behaves as expected when handling events and dispatching actions<br>- It verifies that the correct event is dispatched with the correct configuration, and that no event is dispatched if there is no action in the event detail<br>- The tests validate the functionality of the action handler, providing confidence in its correctness.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/renderers.spec.ts'>renderers.spec.ts</a></b></td>
				<td>- Validate the rendering of temperature and humidity labels in the Home Assistant UI<br>- The test file ensures that the `renderLabel` function correctly handles various scenarios, including empty labels, undefined sensors, and missing unit_of_measurement attributes<br>- It verifies that the correct label is rendered based on the presence or absence of temperature and humidity values.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/styles.spec.ts'>styles.spec.ts</a></b></td>
				<td>- The test file `styles.spec.ts` validates the functionality of styles-related functions within the project's architecture<br>- It ensures that various conditions are met when retrieving card styles based on temperature, humidity, and light states, as well as climate styles and entity icon styles<br>- The tests verify that styles are correctly applied under different scenarios, providing a comprehensive validation of the codebase's styling logic.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/helpers.spec.ts'>helpers.spec.ts</a></b></td>
				<td>- The main purpose of the `helpers.spec.ts` file is to test the functionality of helper functions within the project's architecture<br>- The tests cover various scenarios and edge cases, ensuring that the helper functions behave as expected in different situations<br>- The file provides valuable insights into how the project's core components interact with each other, ultimately contributing to a robust and reliable overall system.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/card.spec.ts'>card.spec.ts</a></b></td>
				<td>- The test suite for the RoomSummaryCard component thoroughly covers its functionality, including rendering climate labels, handling problem entities, and configuration options<br>- The tests ensure that the card renders correctly with various configurations and edge cases, providing a solid foundation for the component's behavior.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/test/fire-event.spec.ts'>fire-event.spec.ts</a></b></td>
				<td>- The test file `fire-event.spec.ts` validates the functionality of the `fireEvent` function, which creates and dispatches custom events to elements or the window object<br>- It ensures that events are created with correct types, details, and properties, and that they can be composed and bubbled through the DOM<br>- The tests cover various scenarios, including config-changed events and different targets.</td>
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
				<td>- The main purpose of the `helpers.ts` file is to provide a collection of utility functions for working with Home Assistant entities, states, and configurations<br>- It achieves this by offering functions such as entity management, state retrieval, UI element creation, and more, ultimately enhancing the overall functionality and user experience of the Home Assistant application.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/editor.ts'>editor.ts</a></b></td>
				<td>- The RoomSummaryCardEditor class serves as the core component of a Home Assistant editor, responsible for rendering and editing room summary card configurations<br>- It achieves this by utilizing a form-based interface to input and validate user data, ultimately updating the associated configuration object<br>- The component integrates with Home Assistant's state management system, enabling seamless data synchronization.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/styles.ts'>styles.ts</a></b></td>
				<td>- The Room Summary Card Styles Module provides dynamic styling logic and CSS definitions for the card layout, handling state and configuration changes to generate adaptive styles<br>- It enables climate-specific styles and icons, as well as entity icon styles based on their state, resulting in a visually appealing and interactive room summary card<br>- The module integrates with Home Assistant's state and configuration data.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/card.ts'>card.ts</a></b></td>
				<td>- The RoomSummaryCard component displays a summary of room information in Home Assistant, showcasing state, climate data, and entity states in a grid layout with interactive elements<br>- It provides an overview of the room's devices, entities, and problems, allowing users to access detailed information at their fingertips<br>- The card is designed to be customizable through its configuration object.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/render.ts'>render.ts</a></b></td>
				<td>- The renderLabel function generates a formatted climate label combining temperature and humidity information when available<br>- It retrieves state data from Home Assistant using the getState helper function and constructs a string with the relevant parts, including unit of measurement if applicable<br>- The resulting template is returned as a TemplateResult or nothing if no valid states are found.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/index.ts'>index.ts</a></b></td>
				<td>- Registers the Room Summary Card custom element with the browser and Home Assistant's custom card registry, making it available for use in dashboards<br>- Ensures compatibility by defining two custom elements and registering a card with the custom card registry, providing a unique identifier, display name, description, preview, and documentation URL.</td>
			</tr>
			</table>
			<details>
				<summary><b>types</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/ha-form.ts'>ha-form.ts</a></b></td>
						<td>- Defines the structure of forms within the project, establishing a common interface for different form types<br>- The HaFormBaseSchema serves as a foundation, while HaFormSelector extends it to include additional properties specific to each form type<br>- This enables uniform data handling and validation across various form implementations, ensuring consistency throughout the codebase.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/editor.ts'>editor.ts</a></b></td>
						<td>- Exposes the ConfigChangedEvent interface, defining a type that represents an event triggered when configuration changes occur within the project<br>- The interface includes a single property, config, which conforms to the Config type imported from the config module<br>- This event is likely used to notify other parts of the application about configuration updates, enabling reactive behavior and ensuring data consistency throughout the system.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/action.ts'>action.ts</a></b></td>
						<td>- The action configuration file defines the structure for handling various navigation events within the project's architecture<br>- It establishes a set of standardized configurations for different types of actions, including navigation, toggle, more information, and no-operation events<br>- This enables consistent and efficient event handling across the codebase, facilitating a scalable and maintainable application.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/homeassistant.ts'>homeassistant.ts</a></b></td>
						<td>- Defines the core structure of Home Assistant integration, providing a unified interface for entities, devices, states, and areas<br>- Establishes a common language for interacting with Home Assistant, enabling seamless data exchange between different components of the system<br>- Facilitates standardized access to entity attributes, device information, and area relationships, ultimately enhancing the overall functionality and maintainability of the project.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/index.ts'>index.ts</a></b></td>
						<td>- Defines the core type definitions and action handlers for the project's architecture, extending the global window interface to include a custom cards array<br>- Establishes interfaces for action handler events, HTML elements, and configuration options, enabling the integration of custom card functionality with Home Assistant DOM events<br>- Provides a foundation for handling various actions, such as hold, tap, and double-tap events.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/types/config.ts'>config.ts</a></b></td>
						<td>- Defines the core configuration structure for card display and behavior within Home Assistant, encompassing entity settings, navigation paths, and feature options<br>- The Config interface serves as a central hub for entity configurations, state information, and problem entities, enabling flexible customization of card layouts and interactions.</td>
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
						<td>- The action handler module enables custom click action handling for web components using the Lit library<br>- It creates a global singleton element that processes click events and dispatches them as Home Assistant actions with specified configuration, supporting features like double-click and hold actions<br>- The module is designed to be used by consumers of this project, providing an action handler for entities with configured options.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/src/common/fire-event.ts'>fire-event.ts</a></b></td>
						<td>- Dispatches custom events for Home Assistant, enabling communication between components within the application<br>- It allows for the creation of a standardized event system, facilitating seamless interaction and data exchange among different parts of the codebase<br>- This enables a more modular and maintainable architecture.</td>
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
						<td>- The main purpose of this code file is to automate the process of releasing a new version of a project<br>- It checks for commits from authorized users, bumps the version number and creates a release, generates release notes, and updates the main branch with the changes<br>- The workflow ensures that releases are created only by approved users and maintains consistency across different branches.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/.github/workflows/pull_request.yaml'>pull_request.yaml</a></b></td>
						<td>- Validate Pull Request Fast Forward<br>- The .github/workflows/pull_request.yaml file ensures the project's integrity by checking if a pull request is fast-forwarded when it's opened, reopened, or synchronized<br>- It verifies the merge history to prevent unwanted changes and maintains the repository's consistency<br>- This validation helps maintain the project's stability and prevents potential issues that could arise from fast-forwarded merges.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/homeassistant-extras/room-summary-card/blob/master/.github/workflows/merge.yaml'>merge.yaml</a></b></td>
						<td>- Merge workflow automates the fast-forward merge process by detecting new issue comments containing the `/merge` command and triggering a GitHub Actions job<br>- The workflow uses a GitHub app token to authenticate and runs on an Ubuntu-based environment, utilizing the `sequoia-pgp/fast-forward` action to perform the merge<br>- It also posts a comment with error information if any issues occur during the process.</td>
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
