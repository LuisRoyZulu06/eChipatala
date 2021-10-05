defmodule Echipatala.Repo do
  use Ecto.Repo,
    otp_app: :echipatala,
    adapter: Ecto.Adapters.Tds
end
