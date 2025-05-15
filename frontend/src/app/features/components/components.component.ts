import { Component } from '@angular/core';

@Component({
    selector: 'app-components',
    imports: [],
    template: `
    <div class="max-w-4xl p-8 text-gray-800 dark:text-gray-200">
      <h1 class="text-4xl font-medium mb-8">
        Angular Material Dashboard Components
      </h1>

      <section class="mb-8">
        <h2 class="text-2xl font-medium mb-4">Overview</h2>
        <p class="mb-4">
          This dashboard template leverages Angular Material components to
          create a modern, responsive, and feature-rich administrative
          interface. Built with Angular Material 16.x, this template provides a
          comprehensive set of pre-built components optimized for dashboard
          layouts and data visualization.
        </p>
        <p class="mb-4">
          The components are fully customizable and follow Material Design
          principles while maintaining accessibility standards (WCAG 2.1). Each
          component is thoroughly tested and optimized for both desktop and
          mobile views.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-medium mb-4">Key Components</h2>
        <div class="space-y-4">
          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 class="text-xl font-medium mb-2">Navigation Components</h3>
            <ul class="list-disc ml-6 space-y-2">
              <li>
                mat-sidenav: Responsive side navigation with customizable width
                and position
              </li>
              <li>
                mat-toolbar: Adaptive header with seamless mobile integration
              </li>
              <li>mat-menu: Dropdown menus with nested navigation support</li>
            </ul>
          </div>

          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 class="text-xl font-medium mb-2">Data Display Components</h3>
            <ul class="list-disc ml-6 space-y-2">
              <li>mat-table: Dynamic data tables with sorting and filtering</li>
              <li>
                mat-card: Flexible content containers for dashboard widgets
              </li>
              <li>mat-grid-list: Responsive grid layout for dashboard tiles</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-medium mb-4">Main Components Description</h2>
        <div class="space-y-6">
          <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h3 class="text-xl font-medium mb-3">Data Tables (mat-table)</h3>
            <p class="mb-4">
              The mat-table component provides a powerful way to display tabular
              data with features including:
            </p>
            <ul class="list-disc ml-6 space-y-2 mb-4">
              <li>Built-in sorting and filtering capabilities</li>
              <li>Pagination integration with mat-paginator</li>
              <li>Column resizing and reordering</li>
              <li>Row selection and expansion panels</li>
            </ul>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Usage: Ideal for displaying large datasets, user lists, and
              analytical data.
            </p>
          </div>

          <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h3 class="text-xl font-medium mb-3">Dashboard Cards (mat-card)</h3>
            <p class="mb-4">
              Mat-card components serve as containers for various types of
              content:
            </p>
            <ul class="list-disc ml-6 space-y-2 mb-4">
              <li>Customizable headers, titles, and subtitles</li>
              <li>Support for images and rich media content</li>
              <li>Action buttons and links integration</li>
              <li>Flexible layout options for content organization</li>
            </ul>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Usage: Perfect for dashboard widgets, statistics displays, and
              feature highlights.
            </p>
          </div>

          <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h3 class="text-xl font-medium mb-3">
              Navigation System (mat-sidenav)
            </h3>
            <p class="mb-4">
              The mat-sidenav provides a comprehensive navigation solution:
            </p>
            <ul class="list-disc ml-6 space-y-2 mb-4">
              <li>Responsive drawer with multiple modes (side, over, push)</li>
              <li>Customizable width and positioning</li>
              <li>Smooth animations and transitions</li>
              <li>Integration with router navigation</li>
            </ul>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Usage: Main navigation container for dashboard applications.
            </p>
          </div>

          <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h3 class="text-xl font-medium mb-3">Form Controls</h3>
            <p class="mb-4">
              Angular Material provides a rich set of form controls:
            </p>
            <ul class="list-disc ml-6 space-y-2 mb-4">
              <li>
                mat-form-field: Wrapper for form inputs with floating labels
              </li>
              <li>
                mat-select: Enhanced dropdown selection with search and
                multi-select
              </li>
              <li>
                mat-datepicker: Date selection with various display formats
              </li>
              <li>mat-autocomplete: Smart input with suggestion support</li>
            </ul>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Usage: Creating interactive forms and data entry interfaces.
            </p>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-medium mb-4">Installation</h2>
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p class="mb-4">Install Angular Material and its dependencies:</p>
          <pre class="bg-gray-200 dark:bg-gray-700 p-4 rounded-sm overflow-x-auto">
npm install &#64;angular/material &#64;angular/cdk &#64;angular/animations</pre
          >
        </div>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-medium mb-4">Theme Customization</h2>
        <p class="mb-4">
          The dashboard supports both light and dark themes through Angular
          Material's theming system. Custom themes can be defined in the
          <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-sm"
            >styles.scss</code
          >
          file:
        </p>
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <ul class="list-disc ml-6 space-y-2">
            <li>Primary color palette customization</li>
            <li>Accent color scheme configuration</li>
            <li>Dark mode toggle support</li>
            <li>Custom typography settings</li>
          </ul>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-medium mb-4">Best Practices</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 class="text-xl font-medium mb-2">Performance</h3>
            <ul class="list-disc ml-6 space-y-2">
              <li>Implement lazy loading for feature modules</li>
              <li>Use virtual scrolling for large lists</li>
              <li>Enable production mode builds</li>
            </ul>
          </div>
          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 class="text-xl font-medium mb-2">Accessibility</h3>
            <ul class="list-disc ml-6 space-y-2">
              <li>Include ARIA labels for interactive elements</li>
              <li>Maintain proper color contrast ratios</li>
              <li>Ensure keyboard navigation support</li>
            </ul>
          </div>
        </div>
      </section>

      <footer class="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          For more detailed documentation and component APIs, please visit the
          <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline"
            >official Angular Material documentation</a
          >.
        </p>
      </footer>
    </div>
  `,
    styles: ``
})
export default class ComponentsComponent {}
