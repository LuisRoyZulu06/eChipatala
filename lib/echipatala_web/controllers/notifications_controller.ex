defmodule EchipatalaWeb.NotificationsController do
  use EchipatalaWeb, :controller

  alias Echipatala.Notifications
  alias Echipatala.Notifications.Email

  def email_logs(conn, _params) do
    log = Notifications.list_emails()
    render(conn, "email_logs.html", log: log)
  end
end
