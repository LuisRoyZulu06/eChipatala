defmodule EchipatalaWeb.Plugs.RequireAdminAccess do
  @behaviour Plug
  import Plug.Conn
  import Phoenix.Controller, only: [put_flash: 3, redirect: 2]

  alias Echipatala.Accounts

  def init(_params) do
  end

  def call(conn, _params) do
    user_id = get_session(conn, :current_user) || get_session(conn, :current_client)
    user = user_id && Accounts.get_user!(user_id)

    with true <- not is_nil(user) && user.user_role != 1 do
      conn
      |> put_flash(:error, "Access denied!!!")
      |> redirect(to: EchipatalaWeb.Router.Helpers.session_path(conn, :new))
      |> halt()
    else
      _ -> conn
    end
  end
end
