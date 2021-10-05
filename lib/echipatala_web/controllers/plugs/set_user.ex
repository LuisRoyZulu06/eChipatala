defmodule EchipatalaWeb.Plugs.SetUser do
  @behaviour Plug
  import Plug.Conn

  alias Echipatala.Accounts

  def init(_params) do
  end

  def call(conn, _params) do
    user_id = get_session(conn, :current_user)

    cond do
      user = user_id && Accounts.get_user!(user_id) ->
        assign(conn, :user, user)

      true ->
        assign(conn, :user, nil)
    end
  end
end
