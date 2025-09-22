// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom test data and fixtures
beforeEach(() => {
  // Reset application state before each test
  cy.window().then((win) => {
    // Clear localStorage
    win.localStorage.clear()
    // Clear sessionStorage
    win.sessionStorage.clear()
  })

  // Intercept and mock API calls for consistent testing
  cy.intercept('GET', '/api/products*', { fixture: 'products.json' }).as('getProducts')
  cy.intercept('GET', '/api/user', { fixture: 'user.json' }).as('getUser')
  cy.intercept('POST', '/api/auth/login', { fixture: 'login-success.json' }).as('login')
  cy.intercept('POST', '/api/auth/register', { fixture: 'register-success.json' }).as('register')
  cy.intercept('POST', '/api/cart', { fixture: 'cart-updated.json' }).as('updateCart')
  cy.intercept('POST', '/api/orders', { fixture: 'order-created.json' }).as('createOrder')
})

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})

// Custom commands for common test operations
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.get('[data-cy="email"]').type(email)
  cy.get('[data-cy="password"]').type(password)
  cy.get('[data-cy="login-button"]').click()
  cy.url({ timeout: 10000 }).should('not.include', '/auth/login')
})

Cypress.Commands.add('register', (userData: any) => {
  cy.visit('/auth/register')
  cy.get('[data-cy="firstName"]').type(userData.firstName)
  cy.get('[data-cy="lastName"]').type(userData.lastName)
  cy.get('[data-cy="email"]').type(userData.email)
  cy.get('[data-cy="password"]').type(userData.password)
  cy.get('[data-cy="confirmPassword"]').type(userData.password)
  cy.get('[data-cy="register-button"]').click()
  cy.url({ timeout: 10000 }).should('not.include', '/auth/register')
})

Cypress.Commands.add('addToCart', (productName: string, quantity = 1) => {
  cy.contains(productName).parents('[data-cy="product-card"]').within(() => {
    // Set quantity if needed
    if (quantity > 1) {
      cy.get('[data-cy="quantity-input"]').clear().type(quantity.toString())
    }
    cy.get('[data-cy="add-to-cart-button"]').click()
  })
  cy.get('[data-cy="cart-notification"]').should('be.visible')
})

Cypress.Commands.add('checkout', () => {
  cy.get('[data-cy="checkout-button"]').click()
  cy.url().should('include', '/checkout')

  // Fill checkout form
  cy.get('[data-cy="shipping-address"]').within(() => {
    cy.get('[data-cy="fullName"]').type('John Doe')
    cy.get('[data-cy="addressLine1"]').type('123 Main St')
    cy.get('[data-cy="city"]').type('Mumbai')
    cy.get('[data-cy="postalCode"]').type('400001')
    cy.get('[data-cy="phone"]').type('9876543210')
  })

  // Select payment method
  cy.get('[data-cy="payment-method"]').within(() => {
    cy.get('[data-cy="card-payment"]').check()
  })

  cy.get('[data-cy="place-order-button"]').click()
  cy.url().should('include', '/order-confirmation')
})
