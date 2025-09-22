# Product Requirements Document (PRD)
# Harsha Delights Frontend Applications

**Document Version**: 1.0
**Created**: September 20, 2025
**Team**: Claude CLI (Lead), DevJi (Technical Lead), Gemini (Support), Windsurf Client (Parallel Development)
**Business Domain**: harshadelights.com

---

## 🎯 PROJECT OVERVIEW

### Business Context
**Company**: Harsha Delights - Premium confectionery business
**Domain**: harshadelights.com
**Products**: Sweets, chocolates, namkeens, dry fruits, buns, cookies, raw materials
**Markets**: B2B (wholesalers, retailers, distributors) + B2C (individual consumers) + International
**Current Challenge**: Manual operations, no customer-facing interfaces, scaling bottlenecks

### Technical Foundation
**Backend Status**: ✅ FULLY IMPLEMENTED
- ERPNext with custom doctypes (inventory, customers, orders)
- Medusa.js e-commerce engine
- API Gateway with comprehensive endpoints
- EspoCRM for customer management
- PostgreSQL + MariaDB + Redis infrastructure
- Docker containerized environment

**Frontend Status**: ❌ COMPLETELY MISSING
**Goal**: Build 4 complete frontend applications using cherry-picked components from 6 high-quality downloaded projects

---

## 🏗️ FRONTEND APPLICATIONS ARCHITECTURE

### 1. 🏠 PUBLIC WEBSITE (harshadelights.com)
**Priority**: PHASE 1 - IMMEDIATE
**Timeline**: 2-3 weeks
**Assigned**: Claude CLI + DevJi (Lead implementation)

#### Business Requirements
- **Primary Goal**: Brand presence, credibility, lead generation
- **Target Users**: General public, potential B2B partners, brand awareness
- **Business Impact**: Foundation for all other applications, SEO ranking, professional credibility

#### Technical Specifications
- **Base Framework**: Shopco E-commerce components (product showcase layouts)
- **Modifications**: Remove e-commerce functionality, focus on marketing/branding
- **Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **CMS**: Content management for blog/news updates
- **Performance**: Lighthouse score 90+, Core Web Vitals optimized

#### Features & User Stories
1. **Landing Page**
   - Hero section with brand story
   - Product categories showcase (sweets, chocolates, namkeens, dry fruits)
   - Trust indicators (quality certifications, awards)
   - Call-to-action for B2B inquiries

2. **About Us**
   - Company history and values
   - Manufacturing process and quality standards
   - Team and facility information
   - Sustainability practices

3. **Products Showcase**
   - Product categories with high-quality images
   - Product specifications and ingredients
   - Quality certifications and standards
   - Bulk ordering information

4. **Contact & Location**
   - Multiple contact methods (phone, email, WhatsApp)
   - Physical location with Google Maps integration
   - Business hours and delivery areas
   - Lead capture forms

5. **Multi-language Support**
   - English (primary)
   - Hindi, Gujarati, Marathi (regional markets)
   - Dynamic language switching
   - Localized content management

6. **SEO & Performance**
   - Meta tags optimization for confectionery keywords
   - Structured data markup for products
   - Fast loading times (<3 seconds)
   - Mobile-responsive design

#### Integration Points
- **API Gateway**: Contact form submissions → `/api/v1/leads`
- **ERPNext**: Product information sync
- **Analytics**: Google Analytics, Facebook Pixel for marketing

---

### 2. 🛒 B2C E-COMMERCE STORE (shop.harshadelights.com)
**Priority**: PHASE 2 - HIGH REVENUE IMPACT
**Timeline**: 3-4 weeks
**Assigned**: Claude CLI + DevJi (Lead), Gemini (UI components)

#### Business Requirements
- **Primary Goal**: Direct sales to individual consumers
- **Target Users**: End consumers, individual buyers, retail customers
- **Business Impact**: New revenue stream, market expansion, customer data collection

#### Technical Specifications
- **Base Framework**: Medusa Next.js Starter (direct backend integration)
- **UI Enhancement**: Shopco UI components (modern design, animations)
- **Tech Stack**: Next.js 15, React 19, TypeScript, Medusa V2 SDK, Redux Toolkit
- **Payment**: Stripe integration (already configured in Medusa)
- **Performance**: Sub-2 second loading, PWA capabilities

#### Features & User Stories
1. **Product Catalog**
   - Category browsing (sweets, chocolates, namkeens, dry fruits)
   - Product search and filtering
   - Product details with images, ingredients, pricing
   - Related products suggestions

2. **Shopping Experience**
   - Add to cart functionality
   - Cart management and quantity updates
   - Wishlist/favorites
   - Guest checkout + registered user checkout

3. **User Account Management**
   - Customer registration and login
   - Order history and tracking
   - Address book management
   - Loyalty points system

4. **Order Processing**
   - Multiple payment options (cards, UPI, wallet)
   - Order confirmation and email notifications
   - Real-time order tracking
   - Delivery estimation

5. **Product Reviews & Social**
   - Customer reviews and ratings
   - Photo reviews
   - Social sharing buttons
   - Customer testimonials

#### Integration Points
- **Medusa Backend**: Direct SDK integration (`@medusajs/js-sdk`)
- **API Gateway**: Customer authentication, order processing
- **ERPNext**: Inventory levels, batch tracking
- **Payment**: Stripe gateway integration

---

### 3. 🏢 B2B CUSTOMER PORTAL (partners.harshadelights.com)
**Priority**: PHASE 3 - BUSINESS SCALING
**Timeline**: 4-6 weeks
**Assigned**: Claude CLI + DevJi (Lead), Windsurf Client (Forms/UI)

#### Business Requirements
- **Primary Goal**: Self-service for wholesale customers, reduce manual order processing
- **Target Users**: Shops, distributors, wholesalers, bulk buyers
- **Business Impact**: Operational efficiency, scalability, customer satisfaction

#### Technical Specifications
- **Base Framework**: WorkOS B2B Starter (enterprise authentication)
- **Enhancement**: React-Admin components (data grids, forms)
- **Tech Stack**: Next.js 15, React 18, TypeScript, WorkOS, Convex DB, Radix UI
- **Authentication**: Enterprise SSO, multi-user organizations
- **Security**: Role-based access control, audit logging

#### Features & User Stories
1. **Authentication & Organization Management**
   - Enterprise login with SSO options
   - Multi-user organizations (shop owners + staff)
   - Role-based permissions (admin, purchaser, viewer)
   - User provisioning and management

2. **Customer-Specific Pricing**
   - Tier-based pricing display (Gold, Silver, Bronze customers)
   - Volume discount calculations
   - Seasonal pricing updates
   - Custom pricing agreements

3. **Bulk Ordering**
   - Quick order forms with SKU input
   - CSV order upload functionality
   - Order templates and favorites
   - Minimum order quantity enforcement

4. **Account Management**
   - Credit limit display and utilization
   - Payment terms and due dates
   - Invoice downloads (PDF)
   - Account statements

5. **Order Management**
   - Order history with advanced filtering
   - Order status tracking
   - Delivery scheduling
   - Order modifications and cancellations

6. **Business Intelligence**
   - Purchase history analytics
   - Spending patterns and trends
   - Product performance insights
   - Demand forecasting

#### Integration Points
- **API Gateway**: `/api/v1/customers/:customerId/pricing`, `/api/v1/orders/bulk`
- **ERPNext**: Customer master, pricing rules, credit limits
- **WorkOS**: Authentication and organization management
- **EspoCRM**: Customer relationship data

---

### 4. 📱 MOBILE APPLICATIONS
**Priority**: PHASE 4 - EFFICIENCY & REACH
**Timeline**: 6-8 weeks
**Assigned**: Gemini (Lead), Windsurf Client (Support), Claude CLI (Architecture guidance)

#### 4A. Customer Mobile App (React Native)
**Base Framework**: Enatega React Native

**Features**:
- Product browsing and ordering
- Order tracking with real-time updates
- Push notifications for order status
- Store locator and contact
- Loyalty program integration

**Tech Stack**: React Native 0.70, Expo 47, Apollo Client (adapted to REST)

#### 4B. Sales Team Mobile App (Flutter)
**Base Framework**: ClientFlow Flutter patterns

**Features**:
- Customer management on-the-go
- Order taking and processing
- Sales analytics and reporting
- Lead management
- Route optimization for delivery

**Tech Stack**: Flutter/Dart, SQLite local storage, REST API integration

#### Integration Points
- **API Gateway**: All endpoints via REST API
- **Push Notifications**: Firebase/Expo notifications
- **Offline Capabilities**: Local SQLite sync

---

## 👥 TEAM STRUCTURE & RESPONSIBILITIES

### 🎯 Primary Development Team

#### **Claude CLI (Technical Lead & Architect)**
**Responsibilities**:
- Overall architecture decisions and quality control
- Complex feature implementation
- Code review and standards enforcement
- Integration between applications
- Problem-solving and technical guidance
- Performance optimization
- Security implementation

**Focus Areas**:
- Phase 1: Public Website (complete implementation)
- Phase 2: B2C E-commerce (core functionality)
- Phase 3: B2B Portal (enterprise features)
- Cross-cutting: API integration, authentication, performance

#### **DevJi (Project Manager & Co-Developer)**
**Responsibilities**:
- Project coordination and timeline management
- Requirements clarification and business logic
- Frontend development (pair programming with Claude CLI)
- Testing and quality assurance
- Deployment and DevOps coordination
- Stakeholder communication

**Focus Areas**:
- All phases: Requirements and business logic
- Frontend development collaboration
- Quality assurance and testing

### ⚡ Parallel Development Team

#### **Gemini (Support Developer)**
**Responsibilities**:
- UI component development
- Low-priority feature implementation
- CSS/styling and responsive design
- Content management and localization
- Documentation and testing support

**Assigned Tasks**:
- Shopco UI components extraction and adaptation
- Mobile app development (Customer App lead)
- Multi-language content management
- Performance optimization support

#### **Windsurf Client (Parallel Development)**
**Responsibilities**:
- Independent feature development
- Form components and data entry interfaces
- Admin panel development
- Reporting and analytics interfaces
- Testing and bug fixes

**Assigned Tasks**:
- B2B Portal forms and data grids
- Admin interfaces development
- Sales Team Mobile App support
- Integration testing

### 🔄 Collaboration Workflow

#### **Decision Making Hierarchy**
1. **Technical Architecture**: Claude CLI (final authority)
2. **Business Requirements**: DevJi (stakeholder representative)
3. **Implementation Details**: Claude CLI + DevJi (collaborative)
4. **Support Tasks**: Gemini + Windsurf (guided by leads)

#### **Communication Protocol**
- **Daily Standup**: Progress updates, blockers, next priorities
- **Weekly Review**: Code quality, timeline assessment, issue resolution
- **Technical Issues**: Escalate to Claude CLI for guidance
- **Business Clarification**: DevJi coordinates with stakeholders

#### **Quality Assurance Process**
- **Code Review**: All code reviewed by Claude CLI before merge
- **Testing Strategy**: Unit tests + integration tests + manual testing
- **Performance Monitoring**: Lighthouse scores, Core Web Vitals
- **Security Review**: Authentication, authorization, data protection

---

## 📋 IMPLEMENTATION METHODOLOGY

### Development Principles
1. **No Shortcuts**: Complete, production-ready implementations
2. **Quality First**: Clean code, proper error handling, comprehensive testing
3. **Honest Assessment**: Accurate progress reporting, realistic timelines
4. **Capitalize on Completed Work**: Build on existing backend infrastructure
5. **Professional Standards**: Enterprise-grade code quality and architecture

### Technical Standards
- **TypeScript**: Mandatory for all new development
- **Testing**: Minimum 80% code coverage
- **Performance**: Lighthouse score 90+
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Comprehensive meta tags and structured data
- **Security**: OWASP guidelines adherence

### Code Quality Gates
- **ESLint + Prettier**: Consistent code formatting
- **Husky Git Hooks**: Pre-commit testing and linting
- **SonarQube**: Code quality and security scanning
- **Automated Testing**: CI/CD pipeline integration

---

## 🎯 SUCCESS METRICS & KPIs

### Phase 1: Public Website
- **Performance**: Page load time < 3 seconds
- **SEO**: Lighthouse SEO score > 95
- **Accessibility**: WCAG 2.1 AA compliance
- **Business**: 100+ monthly lead inquiries

### Phase 2: B2C E-commerce
- **Performance**: Cart abandonment rate < 20%
- **Business**: 500+ monthly orders, $50k+ monthly revenue
- **Technical**: 99.9% uptime, sub-2 second page loads

### Phase 3: B2B Portal
- **Efficiency**: 80% reduction in manual order processing
- **Business**: 90%+ customer adoption, $200k+ monthly B2B orders
- **Technical**: Enterprise security compliance

### Phase 4: Mobile Apps
- **Adoption**: 1000+ app downloads within 3 months
- **Engagement**: 60%+ monthly active users
- **Business**: 30% of orders through mobile channels

---

## 🚨 RISK MANAGEMENT

### Technical Risks
1. **Integration Complexity**: Mitigation → Comprehensive API testing
2. **Performance Issues**: Mitigation → Early performance benchmarking
3. **Security Vulnerabilities**: Mitigation → Security-first development approach
4. **Mobile Platform Differences**: Mitigation → Cross-platform testing strategy

### Business Risks
1. **Scope Creep**: Mitigation → Strict PRD adherence, change control process
2. **Timeline Delays**: Mitigation → Conservative estimates, parallel development
3. **Quality Compromises**: Mitigation → Non-negotiable quality gates
4. **Resource Conflicts**: Mitigation → Clear responsibility matrix

### Mitigation Strategies
- **Weekly Risk Assessment**: Proactive issue identification
- **Escalation Process**: Technical issues → Claude CLI, Business issues → DevJi
- **Backup Plans**: Alternative technology options for critical features
- **Quality Assurance**: Continuous testing and monitoring

---

## 📅 DETAILED TIMELINE

### Phase 1: Public Website (Weeks 1-3)
**Week 1**: Architecture setup, component extraction from Shopco
**Week 2**: Core pages implementation, content management
**Week 3**: SEO optimization, multi-language, testing, deployment

### Phase 2: B2C E-commerce (Weeks 4-7)
**Week 4**: Medusa integration, product catalog
**Week 5**: Shopping cart, checkout process
**Week 6**: User accounts, order management
**Week 7**: Payment integration, testing, optimization

### Phase 3: B2B Portal (Weeks 8-13)
**Week 8-9**: WorkOS authentication, organization setup
**Week 10-11**: Customer-specific pricing, bulk ordering
**Week 12-13**: Account management, business intelligence, testing

### Phase 4: Mobile Apps (Weeks 14-21)
**Week 14-17**: Customer mobile app (React Native)
**Week 18-21**: Sales team mobile app (Flutter)

### Continuous: Integration & Quality
- **Weekly**: Code reviews, performance monitoring
- **Bi-weekly**: Security assessments, integration testing
- **Monthly**: Business metrics review, stakeholder updates

---

## 📚 TECHNICAL DOCUMENTATION

### Required Documentation
1. **API Integration Guide**: How frontends connect to existing backend
2. **Component Library**: Reusable UI components documentation
3. **Deployment Guide**: Production deployment procedures
4. **Testing Strategy**: Automated and manual testing procedures
5. **Performance Optimization**: Benchmarking and optimization techniques

### Knowledge Management
- **Technical Decisions**: Architecture decision records (ADRs)
- **Code Standards**: Style guides and best practices
- **Troubleshooting**: Common issues and solutions
- **Business Logic**: Domain knowledge and business rules

---

**Document Owner**: Claude CLI
**Review Cycle**: Weekly updates, monthly comprehensive review
**Approval Required**: DevJi (Business), Claude CLI (Technical)

---

*This PRD serves as the authoritative source for all frontend development activities. Any changes require approval from both technical and business leads.*