import { renderEntitiesTab } from '@/html/editor/entities-tab';
import { renderLightsTab } from '@/html/editor/lights-tab';
import { renderMainTab } from '@/html/editor/main-tab';
import { renderOccupancyTab } from '@/html/editor/occupancy-tab';
import { renderSensorsTab } from '@/html/editor/sensors-tab';
import { renderTabBar } from '@/html/editor/tab-bar';
import type { SubElementEditorConfig } from '@cards/components/editor/sub-element-editor';
import { areaEntities, deviceClasses } from '@editor/editor-schema';
import { cleanAndFireConfigChanged } from '@editor/utils/fire-config-changed';
import { handleSubElementChanged } from '@editor/utils/handle-sub-element-changed';
import { updateScrollIndicators } from '@editor/utils/update-scroll-indicators';
import type { HASSDomEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import { Task } from '@lit/task';
import type { Config } from '@type/config';
import { CSSResult, html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import type { Ref } from 'lit/directives/ref.js';
import { createRef } from 'lit/directives/ref.js';
import { styles } from '../theme/css/editor';

export class RoomSummaryCardEditor extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Current active tab index
   */
  @state()
  private _currentTab = 0;

  /**
   * Scroll state for tab container
   */
  @state()
  private _showLeftScroll = false;

  @state()
  private _showRightScroll = false;

  /**
   * Reference to the tab bar container for scroll detection
   */
  private _tabContainerRef: Ref<HTMLDivElement> = createRef();

  /**
   * Sub-element editor configuration for editing individual entities
   */
  @state()
  private _subElementEditorConfig?: SubElementEditorConfig;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  public hass!: HomeAssistant;

  /**
   * Task that fetches the entities asynchronously
   * Uses the Home Assistant web sockets Promise
   */
  _getEntitiesTask = new Task(this, {
    task: async ([area]) => {
      if (!area) return { sensorClasses: [], entities: [] };
      const sensorClasses = await deviceClasses(this.hass, area);
      const entities = areaEntities(this.hass, area);
      return {
        sensorClasses,
        entities,
      };
    },
    args: () => [this._config?.area],
  });

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * renders the lit element card
   * @returns The rendered HTML template
   */
  override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    // Show sub-element editor if active
    if (this._subElementEditorConfig) {
      return html`
        <room-summary-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        ></room-summary-sub-element-editor>
      `;
    }

    return renderTabBar({
      currentTab: this._currentTab,
      showLeftScroll: this._showLeftScroll,
      showRightScroll: this._showRightScroll,
      tabContainerRef: this._tabContainerRef,
      onScroll: () => {
        const indicators = updateScrollIndicators(this._tabContainerRef.value);
        this._showLeftScroll = indicators.showLeftScroll;
        this._showRightScroll = indicators.showRightScroll;
      },
      onTabClick: (index: number) => {
        this._currentTab = index;
      },
      tabContent: this._renderTabContent(),
    });
  }

  override updated(
    changedProperties: Map<string | number | symbol, unknown>,
  ): void {
    super.updated(changedProperties);

    // Update scroll indicators after render
    if (
      changedProperties.has('_config') ||
      changedProperties.has('_currentTab')
    ) {
      setTimeout(() => {
        const indicators = updateScrollIndicators(this._tabContainerRef.value);
        this._showLeftScroll = indicators.showLeftScroll;
        this._showRightScroll = indicators.showRightScroll;
      }, 100);
    }
  }

  private _renderTabContent() {
    // Main tab (tab 0)
    if (this._currentTab === 0) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          return renderMainTab({
            hass: this.hass,
            config: this._config,
            entities: value.entities as string[],
            onValueChanged: this._valueChanged.bind(this),
            onEntityRowChanged: this._entityRowChanged.bind(this),
            onEditDetailElement: this._editDetailElement.bind(this),
          });
        },
        error: (error) => html`${error}`,
      });
    }
    // Entities tab (tab 1)
    if (this._currentTab === 1) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          return renderEntitiesTab({
            hass: this.hass,
            config: this._config,
            entities: value.entities as string[],
            onValueChanged: this._valueChanged.bind(this),
            onEntitiesRowChanged: this._entitiesRowChanged.bind(this),
            onEditDetailElement: this._editDetailElement.bind(this),
          });
        },
        error: (error) => html`${error}`,
      });
    }
    // Lights tab (tab 2)
    if (this._currentTab === 2) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          return renderLightsTab({
            hass: this.hass,
            config: this._config,
            entities: value.entities as string[],
            onValueChanged: this._valueChanged.bind(this),
          });
        },
        error: (error) => html`${error}`,
      });
    }
    // Sensors tab (tab 3)
    if (this._currentTab === 3) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          return renderSensorsTab({
            hass: this.hass,
            config: this._config,
            entities: value.entities as string[],
            sensorClasses: value.sensorClasses as string[],
            onValueChanged: this._valueChanged.bind(this),
            onSensorsRowChanged: this._sensorsRowChanged.bind(this),
            onEditDetailElement: this._editDetailElement.bind(this),
          });
        },
        error: (error) => html`${error}`,
      });
    }
    // Occupancy tab (tab 4)
    if (this._currentTab === 4) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          return renderOccupancyTab({
            hass: this.hass,
            config: this._config,
            entities: value.entities as string[],
            onValueChanged: this._valueChanged.bind(this),
          });
        },
        error: (error) => html`${error}`,
      });
    }

    return nothing;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = {
      ...config,
      occupancy: {
        ...config.occupancy,
        entities: config.occupancy?.entities ?? [],
      },
      smoke: {
        ...config.smoke,
        entities: config.smoke?.entities ?? [],
      },
    };
  }

  private _valueChanged(ev: CustomEvent) {
    const config = ev.detail.value as Config;
    cleanAndFireConfigChanged(this, config);
  }

  private _entitiesRowChanged(ev: CustomEvent) {
    const value = ev.detail.value;
    const field = (ev.target as any).field as 'entities' | 'lights';

    // Guard: only process if value is an array (from our custom component)
    // If it's a string, it's from the picker directly and should be ignored
    if (!Array.isArray(value)) {
      return;
    }

    this._config = { ...this._config!, [field]: value };
    cleanAndFireConfigChanged(this, this._config);
  }

  private _sensorsRowChanged(ev: CustomEvent) {
    const value = ev.detail.value;

    // Guard: only process if value is an array (from our custom component)
    // If it's a string, it's from the picker directly and should be ignored
    if (!Array.isArray(value)) {
      return;
    }

    this._config = { ...this._config!, sensors: value };
    cleanAndFireConfigChanged(this, this._config);
  }

  private _entityRowChanged(ev: CustomEvent) {
    const value = ev.detail.value;

    // Guard: only process if value is an array (from our custom component)
    // If it's a string, it's from the picker directly and should be ignored
    if (!Array.isArray(value)) {
      return;
    }

    // Convert array back to single entity (take first element or undefined)
    const entityValue = value.length > 0 ? value[0] : undefined;

    this._config = { ...this._config!, entity: entityValue };
    cleanAndFireConfigChanged(this, this._config);
  }

  private _editDetailElement(
    ev: HASSDomEvent<{
      subElementConfig: SubElementEditorConfig;
    }>,
  ): void {
    const config = { ...ev.detail.subElementConfig };

    // Set type to 'sensor' if we're on the sensors tab (tab 3)
    if (this._currentTab === 3 && config.field === 'entities') {
      config.type = 'sensor';
    }

    // Set isMainEntity to true if we're on the main tab (tab 0) and field is 'entities'
    // Main entity is edited on tab 0, entities list is edited on tab 1
    config.isMainEntity = this._currentTab === 0 && config.field === 'entities';

    this._subElementEditorConfig = config;
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass || !this._subElementEditorConfig) {
      return;
    }

    const value = ev.detail.config;
    const result = handleSubElementChanged(
      this._config,
      value,
      this._subElementEditorConfig,
      this._currentTab,
    );

    this._config = result.config;

    // Update sub-element editor config with the new value
    this._subElementEditorConfig = {
      ...this._subElementEditorConfig,
      elementConfig: value,
    };

    if (result.shouldGoBack) {
      this._goBack();
    }

    ev.detail.value = this._config;
    cleanAndFireConfigChanged(this, this._config);
  }

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }
}
