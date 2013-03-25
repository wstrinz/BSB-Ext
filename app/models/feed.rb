class Feed < ActiveRecord::Base
  attr_accessible :etag, :feed_url, :last_update, :title, :url
  has_many :stories
  belongs_to :user

  def fetch_and_parse
    @fzfeed = Feedzirra::Feed.fetch_and_parse(self.url)
  end

  def reload_feed
    fetch_and_parse
    self.title = @fzfeed.title
    self.feed_url = @fzfeed.feed_url
    self.last_update = Time.now
    self.etag = @fzfeed.etag
    self.save
  end

  def reload_stories
    fetch_and_parse
    @fzfeed.entries.each do |entry|
      unless self.stories.where("title = ?",entry.title).count > 0 ## note: needs to work for updating stories and having ones w/ same title
        # puts "entry: #{entry}"
        summary = (entry.summary ? entry.summary.sanitize : entry.summary)
        content = (entry.content ? entry.content.sanitize : summary)

        newStory = Story.create!(title: entry.title, url: entry.url, author: entry.author, summary: summary,
          content: content, published: entry.published, source: @fzfeed.title)
        self.stories << newStory

        self.user.stories << newStory unless self.user.stories.index { |story| story.url == entry.url }
      end
    end
    puts "stories: #{self.stories}"
  end

  def get_all_stories
    reload_stories
    self.stories
  end

  def get_top_stories(n, type) ##passed references to user should probably be refactored as ownership
    reload_stories
    # puts "story: #{stories}"
    if(type == "New")
      findstories = self.stories & self.user.stories
      puts "user: #{findstories.count}"
      findstories.sort_by(&:published).reverse.take(n)
    else
      findstories = self.stories
      findstories.find(:all, :limit => n, :order => "published DESC")
    end
  end

  def get_stories_after(url, number, type)
    pivotStory = stories.where("url = ?", url).first
    ordered_stories = stories.sort_by(&:published).reverse
    if(type == "New")
      ordered_stories = ordered_stories & self.user.stories
    end
    newPivot = ordered_stories.index(pivotStory) + 1
    if ordered_stories.count < (newPivot + number)
      ordered_stories[newPivot..(ordered_stories.count-1)]
    else
      ordered_stories[newPivot..(newPivot+number)]
    end
  end
end
