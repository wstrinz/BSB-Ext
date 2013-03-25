class Feed < ActiveRecord::Base
  attr_accessible :etag, :feed_url, :last_update, :title, :url
  has_many :stories

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

        self.stories << Story.create!(title: entry.title, url: entry.url, author: entry.author, summary: summary,
          content: content, published: entry.published, source: @fzfeed.title)
      end
    end
    puts "stories: #{self.stories}"
  end

  def get_all_stories
    reload_stories
    self.stories
  end

  def get_top_stories(n)
    reload_stories
    puts "story: #{stories}"
    stories.find(:all, :limit => n)
  end

  def get_stories_after(url, number)
    pivotStory = stories.where("url = ?", url).first
    ordered_stories = stories.sort_by(&:published).reverse
    newPivot = ordered_stories.index(pivotStory) + 1
    if ordered_stories.count < (newPivot + number)
      ordered_stories[newPivot..(ordered_stories.count-1)]
    else
      ordered_stories[newPivot..(newPivot+number)]
    end
  end
end
