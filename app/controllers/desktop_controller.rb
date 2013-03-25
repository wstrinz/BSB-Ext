class DesktopController < ApplicationController
  before_filter :authenticate_user!
  def show
  end

  def get_feeds
    # puts "feed: #{Feed.all}"
    Feed.all.each do |f|
      f.reload_feed
    end
    @feedReply = Feed.all.map {|feed| {"name" => feed.title, "url" => feed.url,
     "unread" => (feed.stories & current_user.stories).count}}
    puts @feedReply
    respond_to do |format|
      format.json { render :json => @feedReply.to_json}
    end
  end

  def get_stories
    @feed = Feed.where("feed_url = ?", params[:url]).first
    respond_to do |format|
      format.json { render :json => @feed.get_top_stories(5, params[:type]).to_json }
    end
  end

  def add_feed
    @feed = Feed.create!(url: params[:feedurl])
    current_user.feeds << @feed
    respond_to do |format|
      format.json { render :json => @feed.to_json }
    end
  end

  def get_all_stories
    # @stories = []
    # Feed.all.each do |feed|
    #   feed.stories.each do |story|
    #     @stories << story
    #   end
    # end
    if(params[:type] == "New")
      @stories = current_user.stories.find(:all, :order => "published DESC", :limit => 10)
    else
      @stories = Story.find(:all, :order => "published DESC", :limit => 10)
    end

    respond_to do |format|
      format.json { render :json => @stories.to_json }
    end
  end


  def get_more_stories
    @number_to_load = 5
    if(params[:feedUrl] && params[:feedUrl] != "")
      ## get more stories for eed
      @feed = Feed.where("feed_url = ?", params[:feedUrl]).first
      @reply_stories = @feed.get_stories_after(params[:storyUrl], @number_to_load, params[:type])
    else
      ## get more stories for all feeds
      pivotStory = Story.where("url = ?", params[:storyUrl]).first
      ordered_stories = Story.all.sort_by(&:published).reverse
      if(params[:type] == "New")
        ordered_stories = ordered_stories & current_user.stories
      end
      newPivot = ordered_stories.index(pivotStory) + 1
      if ordered_stories.count < (newPivot + @number_to_load)
       @reply_stories = ordered_stories[newPivot..(ordered_stories.count-1)]
      else
       @reply_stories = ordered_stories[newPivot..(newPivot+@number_to_load)]
      end
    end

    respond_to do |format|
      format.json { render :json => @reply_stories.to_json }
    end
    # @story = Story.all.sort_by(&:published).reverse[session[:all_index]]
  end

  def mark_read
    @user = current_user
    @story = Story.where("url = ?",params[:url]).first
    # @story = @user.stories.where("url = ?",params[:url])
    # puts("url: #{params[:url]}")
    # puts("story: #{@story}")
    # puts("user has: #{@user.stories.include?(@story)}")
    @user.stories.delete(@story)
    # puts("isDeleted?: #{@user.stories.include?(@story)}")
    # puts("Still Exists?: #{Story.where("url = ?",params[:url])}")
    respond_to do |format|
      format.json { render :json => {success: true} }
    end
  end

  def mark_unread
    @user = current_user
    @story = Story.where("url = ?",params[:url]).first
    puts("url: #{params[:url]}")
    puts("story: #{@story}")
    puts("user has: #{@user.stories.include?(@story)}")
    @user.stories << @story
    puts("user has: #{@user.stories.include?(@story)}")
    respond_to do |format|
      format.json { render :json => {success: true} }
    end
  end
end
