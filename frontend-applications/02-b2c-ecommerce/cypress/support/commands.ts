// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      register(userData: any): Chainable<void>
      addToCart(productName: string, quantity?: number): Chainable<void>
      checkout(): Chainable<void>
      searchProducts(query: string): Chainable<void>
      visitCategory(category: string): Chainable<void>
      logout(): Chainable<void>
      visitProduct(productName: string): Chainable<void>
    }
  }
}

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.get('[data-cy="email"]').type(email)
  cy.get('[data-cy="password"]').type(password)
  cy.get('[data-cy="login-button"]').click()
  cy.url({ timeout: 10000 }).should('not.include', '/auth/login')
})

// Custom command to register
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

// Custom command to add to cart
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

// Custom command to checkout
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

// Custom command to search products
Cypress.Commands.add('searchProducts', (query: string) => {
  cy.get('[data-cy="search-input"]').type(query)
  cy.get('[data-cy="search-button"]').click()
  cy.url().should('include', `search?q=${encodeURIComponent(query)}`)
})

// Custom command to visit category
Cypress.Commands.add('visitCategory', (category: string) => {
  cy.get('[data-cy="category-nav"]').contains(category).click()
  cy.url().should('include', `/categories/${category.toLowerCase()}`)
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click()
  cy.get('[data-cy="logout-button"]').click()
  cy.url().should('include', '/auth/login')
})

// Custom command to visit product
Cypress.Commands.add('visitProduct', (productName: string) => {
  cy.contains(productName).parents('[data-cy="product-card"]').within(() => {
    cy.get('[data-cy="product-link"]').click()
  })
  cy.url().should('include', '/products/')
})

export {}
