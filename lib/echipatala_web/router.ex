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

  pipeline :no_layout do
    plug :put_layout, false
  end


  scope "/", EchipatalaWeb do
    pipe_through([:session, :app])
    get("/", SessionController, :new)
    post("/", SessionController, :create)
  end

  scope "/", EchipatalaWeb do
    pipe_through([:browser, :no_layout])
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
    get "/Profile", UserController, :user_profile


    # ---------------------------Institution Management
    get "/Institution/Management", InstitutionController, :institution_management
    post "/Create/Institution", InstitutionController, :create_institution
    get "/Institution/Details", InstitutionController, :inst_details
    post "/Update/Institution/Details", InstitutionController, :update_institution_details
    get "/Institution/Statistics", InstitutionController, :institution_stats
  end

  # Other scopes may use custom stacks.
  # scope "/api", EchipatalaWeb do
  #   pipe_through :api
  # end
end
