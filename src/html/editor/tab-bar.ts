import { html, nothing, type TemplateResult } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { ref } from 'lit/directives/ref.js';

export interface TabBarParams {
  currentTab: number;
  showLeftScroll: boolean;
  showRightScroll: boolean;
  tabContainerRef: Ref<HTMLDivElement>;
  onScroll: () => void;
  onTabClick: (index: number) => void;
  tabContent: TemplateResult | typeof nothing | unknown;
}

/**
 * Renders the tab bar with scroll indicators and tab buttons
 * @param params - Parameters for rendering the tab bar
 * @returns TemplateResult with the tab bar HTML
 */
export function renderTabBar(params: TabBarParams): TemplateResult {
  const {
    currentTab,
    showLeftScroll,
    showRightScroll,
    tabContainerRef,
    onScroll,
    onTabClick,
    tabContent,
  } = params;

  return html`
    <div class="card-config">
      <div class="tab-bar-wrapper">
        <div
          class="scroll-indicator scroll-indicator-left ${showLeftScroll
            ? 'visible'
            : ''}"
        >
          <svg class="scroll-arrow" viewBox="0 0 24 24">
            <path
              d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
            />
          </svg>
        </div>
        <div
          class="tab-bar-container"
          ${ref(tabContainerRef)}
          @scroll=${onScroll}
        >
          <div class="custom-tab-bar">
            <button
              class="custom-tab ${currentTab === 0 ? 'active' : ''}"
              @click=${() => onTabClick(0)}
            >
              Main
            </button>
            <button
              class="custom-tab ${currentTab === 1 ? 'active' : ''}"
              @click=${() => onTabClick(1)}
            >
              Entities
            </button>
            <button
              class="custom-tab ${currentTab === 2 ? 'active' : ''}"
              @click=${() => onTabClick(2)}
            >
              Lights
            </button>
            <button
              class="custom-tab ${currentTab === 3 ? 'active' : ''}"
              @click=${() => onTabClick(3)}
            >
              Sensors
            </button>
            <button
              class="custom-tab ${currentTab === 4 ? 'active' : ''}"
              @click=${() => onTabClick(4)}
            >
              Occupancy
            </button>
          </div>
        </div>
        <div
          class="scroll-indicator scroll-indicator-right ${showRightScroll
            ? 'visible'
            : ''}"
        >
          <svg class="scroll-arrow" viewBox="0 0 24 24">
            <path
              d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
            />
          </svg>
        </div>
      </div>
      ${tabContent}
    </div>
  `;
}
