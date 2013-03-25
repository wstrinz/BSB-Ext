class DesktopController < ApplicationController
  def show
  end

  def get_feeds
    # puts "feed: #{Feed.all}"
    Feed.all.each do |f|
      f.reload_feed
    end
    @feedReply = Feed.all.map {|feed| {"name" => feed.title, "url" => feed.url}}
    puts @feedReply
    respond_to do |format|
      format.json { render :json => @feedReply.to_json}
    end
  end

  def get_stories
    @feed = Feed.where("feed_url = ?", params[:url]).first
    respond_to do |format|
      format.json { render :json => @feed.get_top_stories(5).to_json }
    end
  end

  def add_feed
    @feed = Feed.create!(url: params[:feedurl])
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
    @stories = Story.find(:all, :order => "published DESC", :limit => 10)
    respond_to do |format|
      format.json { render :json => @stories.to_json }
    end
  end


  def get_more_stories
    @number_to_load = 5
    if(params[:feedUrl] && params[:feedUrl] != "")
      ## get more stories for eed
      @feed = Feed.where("feed_url = ?", params[:feedUrl]).first
      @reply_stories = @feed.get_stories_after(params[:storyUrl], @number_to_load)
    else
      ## get more stories for all feeds
      pivotStory = Story.where("url = ?", params[:storyUrl]).first
      ordered_stories = Story.all.sort_by(&:published).reverse
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
end
