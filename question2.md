When designing an identity management solution for a new Node.js microservice, what are the key architectural considerations you prioritize to ensure it's secure, scalable and maintanable?
How do these differ when working with an external IdP like Okta versus an internal one like AD?

If we use an internal IdP like AD, we have a greater control at the cost of more operational overhead and complexity.
Haven't worked with an external IdP before, but I think there must be a shared responsibility between this external provider and its customers. The external service has to ensure their services are highly available and scalable. I think of it as the AWS shared-responsibility model.

Key considerations:
* Security
  - Using TLS everywhere
  - Following the best practices such as lest-privilege
  RBAC and audit logs.
* Scalable:
  - This applies to internal IdPs as it becomes our responsibility. May require load balancers and multiple domain controllers.