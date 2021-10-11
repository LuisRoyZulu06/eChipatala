defmodule BulkAccountOpeningWeb.Router do
  use BulkAccountOpeningWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :no_layout do
   plug :put_layout, false
  end

  scope "/", BulkAccountOpeningWeb do
    pipe_through [:browser, :no_layout]

    get "/", SessionController, :login
    get "/create/account", SessionController, :signup
  end

  scope "/", BulkAccountOpeningWeb do
    pipe_through :browser

    get "/dashboard", PageController, :index
  end

  # # ---------------------- ROUTE FOR LOGIN -----


  # Other scopes may use custom stacks.
  # scope "/api", BulkAccountOpeningWeb do
  #   pipe_through :api
  # end
end
