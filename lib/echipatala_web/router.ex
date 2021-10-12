defmodule EchipatalaWeb.Router do
  use EchipatalaWeb, :router

  pipeline :browser do
    plug :accepts, ["html", "json"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug(EchipatalaWeb.Plugs.SetUser)
    plug(EchipatalaWeb.Plugs.SessionTimeout, timeout_after_seconds: 30000)
  end

  pipeline :session do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :app do
    plug(:put_layout, {EchipatalaWeb.LayoutView, :app})
  end

  pipeline :staff do
    plug(:put_layout, {EchipatalaWeb.LayoutView, :staff})
  end

  pipeline :client do
    plug(:put_layout, {EchipatalaWeb.LayoutView, :client})
  end

  pipeline :no_layout do
    plug :put_layout, false
  end


  scope "/", EchipatalaWeb do
    pipe_through([:session, :app])
    get("/", SessionController, :new)
    post("/", SessionController, :create)
    post("/Register", UserController, :register_user)
  end

  scope "/", EchipatalaWeb do
    pipe_through([:browser, :no_layout])
    get "/Profile", UserController, :user_profile
    get("/logout/current/user", SessionController, :signout)
    get "/Account/Disabled", SessionController, :error_405
    get "/Help/User/Permissions", UserController, :user_permission
    get("/new/password", UserController, :new_password)
    get("/login/otp", SessionController, :otp)
    post("/login/validate/otp", SessionController, :validate_otp)
    get("/Forgot/Password", UserController, :forgot_password)
    post("/Password/Reset", UserController, :forgot_password_reset)
    get "/Help/Center", RespondenceController, :help_center
  end

  scope "/", EchipatalaWeb do
    pipe_through([:browser, :app])
    get "/Dashboard", UserController, :dashboard

    # ---------------------------User Management
    post "/Create/User", UserController, :create_institution_user
    get("/system/users", UserController, :system_users)
    post("/system/users/table", UserController, :system_users_table)
    get("/Client/users", UserController, :client_users)
    post("/Client/users/table", UserController, :clients_table)


    # ---------------------------Institution Management
    get "/Institution/Management", InstitutionController, :institution_management
    post "/Create/Institution", InstitutionController, :create_institution
    get "/Institution/Details", InstitutionController, :inst_details
    post "/Update/Institution/Details", InstitutionController, :update_institution_details
    get "/Institution/Statistics", InstitutionController, :institution_stats

    # ---------------------------Notifications Management
    get "/Email/Logs", NotificationsController, :email_logs

    # =====================Logs Controller===============
    get("Email/Logs", LogsController, :email_logs)
    post("/Email/Logs/Table", LogsController, :email_log_table)
    get "/User/Activity/Logs", LogsController, :user_logs
  end

  scope "/", EchipatalaWeb do
    pipe_through([:browser, :client])
    get("/Client/Dashboard", ClientController, :index)

    # ---------------------------Chat Management
    get "/Consult", ChatController, :consult
    #-- To check and verify
    get("/Client/institutions", ClientController, :institutions)
    get("/Client/institution", ClientController, :institution)

    # ---------------------------Appointment Management
    get "/Appointments", ClientController, :appointments

    # ====================self assessment======================
    get("/Self/Assessment", SelfAssessmentController, :index)
    post "/Self/Assessment", SelfAssessmentController, :assess
    get("/Self/Assessment/Results", SelfAssessmentController, :results)
    # post "/zamtel/mobile/deposit", SelfAssessmentController, :deposit
    # post "/zamtel/deposit/reports", SelfAssessmentController, :deposit_reports
    # post "/Simulate/Zamtel/Data", SelfAssessmentController, :simulate_zamtel_data
    # post "/zamtel/admin/reports", SelfAssessmentController, :admin_report
  end

  scope "/", EchipatalaWeb do
    pipe_through([:browser, :staff])
    get("/Staff/Dashboard", StaffController, :index)
    get("/Staff/appointments", StaffController, :appointments)

    #--------------service controller --------
    get("/Service", ServiceController, :index)
    post("/Service/create", ServiceController, :create)
    get("/Service/subs", ServiceController, :sub_services)

    # ---------------------------Chat Management
    get "/Messages", ChatController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", EchipatalaWeb do
  #   pipe_through :api
  # end
end
