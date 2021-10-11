defmodule BulkAccountOpening.Repo do
  use Ecto.Repo,
    otp_app: :bulk_account_opening,
    adapter: Tds.Ecto
    # adapter: Ecto.Adapters.Postgres
end
