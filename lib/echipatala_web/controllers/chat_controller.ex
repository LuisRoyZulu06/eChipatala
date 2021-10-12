defmodule EchipatalaWeb.ChatController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false

  alias Echipatala.Chat
  alias Echipatala.Accounts
  alias Echipatala.Accounts.User
  alias Echipatala.Chat.ChatDetails
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}


  def index(conn, _params) do
    render(conn, "index.html")
  end

  def consult(conn, _params) do
    # select_staff = Accounts.get_institution_student(id)
    render(conn, "consult.html")
  end
end
