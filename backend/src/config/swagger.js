const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "VitaLine API",
      version: "1.0.0",
      description: "VitaLine appointment and healthcare management API.",
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication and session management" },
      { name: "Appointments", description: "Appointment operations" },
      { name: "Doctors", description: "Doctor operations" },
      { name: "Patients", description: "Patient operations" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        accessCookie: {
          type: "apiKey",
          in: "cookie",
          name: "access_token",
        },
        refreshCookie: {
          type: "apiKey",
          in: "cookie",
          name: "refresh_token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Invalid credentials" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", example: "field" },
                  value: { type: "string", example: "invalid-value" },
                  msg: { type: "string", example: "Field is invalid" },
                  path: { type: "string", example: "email" },
                  location: { type: "string", example: "body" },
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "Ada Lovelace" },
            email: {
              type: "string",
              format: "email",
              example: "ada@example.com",
            },
            phone: { type: "string", example: "01234567890" },
            image: { type: "string", example: "profile-image.jpg" },
            role: { type: "string", enum: ["admin", "doctor", "patient"] },
          },
        },
        DateRange: {
          type: "object",
          required: ["start", "end"],
          properties: {
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" },
          },
        },
        Doctor: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userId: { $ref: "#/components/schemas/User" },
            title: {
              type: "string",
              enum: [
                "Dr.",
                "Ast. Dr.",
                "Uzm. Dr.",
                "Op. Dr.",
                "Doç. Dr.",
                "Prof. Dr.",
              ],
            },
            speciality: { type: "string", example: "Cardiology" },
            unavailableDates: {
              type: "array",
              items: { $ref: "#/components/schemas/DateRange" },
            },
          },
        },
        Patient: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userId: { $ref: "#/components/schemas/User" },
            accountStatus: { type: "string", enum: ["enabled", "disabled"] },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            doctorId: { $ref: "#/components/schemas/Doctor" },
            patientId: { $ref: "#/components/schemas/Patient" },
            dateAndTime: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["scheduled", "completed", "cancelled"],
            },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a patient",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            201: { description: "Patient registered successfully" },
            400: { $ref: "#/components/responses/BadRequest" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: { description: "Logged in successfully" },
            400: { $ref: "#/components/responses/BadRequest" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh the access token",
          security: [{ refreshCookie: [] }],
          responses: {
            200: { description: "Token refreshed successfully" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Log out",
          security: [],
          responses: { 200: { description: "Logged out successfully" } },
        },
      },
      "/doctors": {
        get: {
          tags: ["Doctors"],
          summary: "List doctors",
          parameters: [{ $ref: "#/components/parameters/Speciality" }],
          responses: {
            200: { description: "Doctors returned successfully" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
        post: {
          tags: ["Doctors"],
          summary: "Create a doctor",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateDoctorRequest" },
              },
            },
          },
          responses: {
            201: { description: "Doctor created successfully" },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/doctors/me": {
        get: {
          tags: ["Doctors"],
          summary: "Get the logged-in doctor's profile",
          responses: {
            200: { description: "Doctor profile returned successfully" },
          },
        },
      },
      "/doctors/{id}": {
        get: {
          tags: ["Doctors"],
          summary: "Get a doctor by ID",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Doctor returned successfully" },
            400: { $ref: "#/components/responses/BadRequest" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
        patch: {
          tags: ["Doctors"],
          summary: "Update a doctor",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateDoctorRequest" },
              },
            },
          },
          responses: {
            200: { description: "Doctor updated successfully" },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
        delete: {
          tags: ["Doctors"],
          summary: "Delete a doctor",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: { 200: { description: "Doctor deleted successfully" } },
        },
      },
      "/patients": {
        get: {
          tags: ["Patients"],
          summary: "List patients",
          responses: { 200: { description: "Patients returned successfully" } },
        },
      },
      "/patients/me": {
        get: {
          tags: ["Patients"],
          summary: "Get the logged-in patient's profile",
          responses: {
            200: { description: "Patient profile returned successfully" },
          },
        },
      },
      "/patients/{id}": {
        get: {
          tags: ["Patients"],
          summary: "Get a patient by ID",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: { 200: { description: "Patient returned successfully" } },
        },
        patch: {
          tags: ["Patients"],
          summary: "Update a patient's account status",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdatePatientRequest" },
              },
            },
          },
          responses: { 200: { description: "Patient updated successfully" } },
        },
        delete: {
          tags: ["Patients"],
          summary: "Delete a patient",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: { 200: { description: "Patient deleted successfully" } },
        },
      },
      "/appointments": {
        get: {
          tags: ["Appointments"],
          summary: "List appointments",
          parameters: [
            { $ref: "#/components/parameters/DoctorId" },
            { $ref: "#/components/parameters/PatientId" },
          ],
          responses: {
            200: { description: "Appointments returned successfully" },
          },
        },
        post: {
          tags: ["Appointments"],
          summary: "Create an appointment",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateAppointmentRequest",
                },
              },
            },
          },
          responses: {
            201: { description: "Appointment created successfully" },
          },
        },
      },
      "/appointments/{id}": {
        get: {
          tags: ["Appointments"],
          summary: "Get an appointment by ID",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Appointment returned successfully" },
          },
        },
        patch: {
          tags: ["Appointments"],
          summary: "Update an appointment",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateAppointmentRequest",
                },
              },
            },
          },
          responses: {
            200: { description: "Appointment updated successfully" },
          },
        },
        delete: {
          tags: ["Appointments"],
          summary: "Delete an appointment",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Appointment deleted successfully" },
          },
        },
      },
    },
  },
  apis: [],
};

options.definition.components.schemas.RegisterRequest = {
  type: "object",
  required: ["name", "email", "phone", "password", "confirmPassword"],
  properties: {
    name: { type: "string", example: "Ada Lovelace" },
    email: { type: "string", format: "email", example: "ada@example.com" },
    phone: { type: "string", example: "01234567890" },
    password: { type: "string", format: "password", example: "Strong123" },
    confirmPassword: {
      type: "string",
      format: "password",
      example: "Strong123",
    },
  },
};

options.definition.components.schemas.LoginRequest = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email", example: "ada@example.com" },
    password: { type: "string", format: "password", example: "Strong123" },
  },
};

options.definition.components.schemas.CreateDoctorRequest = {
  type: "object",
  required: [
    "name",
    "email",
    "phone",
    "password",
    "title",
    "image",
    "speciality",
  ],
  properties: {
    name: { type: "string", example: "Ada Lovelace" },
    email: { type: "string", format: "email", example: "ada@example.com" },
    phone: { type: "string", example: "01234567890" },
    password: { type: "string", format: "password", example: "Strong123" },
    title: {
      type: "string",
      enum: ["Dr.", "Ast. Dr.", "Uzm. Dr.", "Op. Dr.", "Doç. Dr.", "Prof. Dr."],
    },
    image: { type: "string", example: "doctor-image.jpg" },
    speciality: { type: "string", example: "Cardiology" },
    unavailableDates: {
      type: "array",
      items: { $ref: "#/components/schemas/DateRange" },
    },
  },
};

options.definition.components.schemas.UpdateDoctorRequest = {
  type: "object",
  properties: {
    name: { type: "string", example: "Ada Lovelace" },
    email: { type: "string", format: "email", example: "ada@example.com" },
    phone: { type: "string", example: "01234567890" },
    password: { type: "string", format: "password", example: "Strong123" },
    title: { type: "string" },
    image: { type: "string" },
    speciality: { type: "string" },
    unavailableDates: {
      type: "array",
      items: { $ref: "#/components/schemas/DateRange" },
    },
  },
};

options.definition.components.schemas.UpdatePatientRequest = {
  type: "object",
  required: ["accountStatus"],
  properties: {
    accountStatus: { type: "string", enum: ["enabled", "disabled"] },
  },
};

options.definition.components.schemas.CreateAppointmentRequest = {
  type: "object",
  required: ["doctorId", "patientId", "dateAndTime"],
  properties: {
    doctorId: { type: "string", example: "507f1f77bcf86cd799439011" },
    patientId: { type: "string", example: "507f1f77bcf86cd799439012" },
    dateAndTime: { type: "string", format: "date-time" },
    status: { type: "string", enum: ["scheduled", "completed", "cancelled"] },
  },
};

options.definition.components.schemas.UpdateAppointmentRequest = {
  type: "object",
  properties: {
    doctorId: { type: "string", example: "507f1f77bcf86cd799439011" },
    patientId: { type: "string", example: "507f1f77bcf86cd799439012" },
    dateAndTime: { type: "string", format: "date-time" },
    status: { type: "string", enum: ["scheduled", "completed", "cancelled"] },
  },
};

options.definition.components.parameters = {
  Id: {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string" },
    example: "507f1f77bcf86cd799439011",
  },
  DoctorId: {
    name: "doctorId",
    in: "query",
    schema: { type: "string" },
  },
  PatientId: {
    name: "patientId",
    in: "query",
    schema: { type: "string" },
  },
  Speciality: {
    name: "speciality",
    in: "query",
    schema: { type: "string" },
  },
};

options.definition.components.responses = {
  BadRequest: {
    description: "Bad request",
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/Error" } },
    },
  },
  Unauthorized: {
    description: "Authentication required",
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/Error" } },
    },
  },
  Forbidden: {
    description: "Insufficient permissions",
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/Error" } },
    },
  },
  NotFound: {
    description: "Resource not found",
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/Error" } },
    },
  },
};

module.exports = swaggerJSDoc(options);
