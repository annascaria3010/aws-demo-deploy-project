class SessionsController < ApplicationController
  def new
  end

  def create
    email = params[:email].to_s.strip
    password = params[:password].to_s

    if email == VALID_USER_EMAIL && password == VALID_USER_PASSWORD
      session[:current_user_email] = email
      redirect_to root_path, notice: "Signed in successfully."
    else
      flash.now[:alert] = "Invalid email or password."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    reset_session
    redirect_to login_path, notice: "Signed out successfully."
  end
end
