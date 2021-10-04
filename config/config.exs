# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :echipatala,
  ecto_repos: [Echipatala.Repo]

# Configures the endpoint
config :echipatala, EchipatalaWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "GL408pFKI6V8wZL1reO1ubpYoZwDPh2TT8UaSD2cDsoQPoTxPPeK3atZjb7RfX/b",
  render_errors: [view: EchipatalaWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Echipatala.PubSub, adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
