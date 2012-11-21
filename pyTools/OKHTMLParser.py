'''a derived class from HTMLParser.HTMLParser to hightlight the words in query,
which can process most str including regex-syntax and html-charref.
Attention: this version only highlight the keywords wrapped in <a> tag,
for others modification is needed.
'''
from HTMLParser import HTMLParser
from cgi import escape#it seems the django.utils.html.conditional_escape being more powerfull...
import re
class queryHLParser(HTMLParser):
	def __init__(self,query):
		#query is the list of keywords,eg:['yu','aoi']
		self.reset(query)
	def reset(self,query):

		query=[escape(word) for word in query]
		words='|'.join(query)
		self.Q_PATTERN=re.compile(r'(?P<query>' + words + r')',re.I)
		self.highlight=0
		self.pieces = []
		self.node_text = []
		HTMLParser.reset(self)
		
	def handle_starttag(self, tag, attrs):
		self.put_node_text()#before handling the tag, process the text coufronted before
		if tag=='a':
			tag_class=dict(attrs).get('class','')
			if tag_class.find('title')!=-1:
				self.highlight+=1
		strattrs = "".join([' %s="%s"' % (key, escape(value)) for key, value in attrs])
		self.pieces.append("<%(tag)s%(strattrs)s>" % locals())

	def handle_endtag(self, tag):
		self.put_node_text()
		self.pieces.append("</%(tag)s>" % locals())
		if tag=='a':
			if self.highlight>0:
				self.highlight-=1

	def handle_charref(self, ref):
		self.put_node_text("&#%(ref)s;" % locals())
		
	def handle_entityref(self, name):
		self.put_node_text("&%(name)s;" % locals())

	def handle_data(self, text):
		self.put_node_text(text)
		
	def handle_comment(self, text):
		self.put_node_text()
		self.pieces.append("<!--%(text)s-->" % locals())
		
	def handle_pi(self, text):
		self.put_node_text()
		self.pieces.append("<?%(text)s>" % locals())

	def handle_decl(self, text):
		self.pieces.append("<!%(text)s>" % locals())
	def unknown_decl(self,text):
		self.pieces.append("<!%(text)s>" % locals())
	
	def put_node_text(self,text=None):
		if text:
			#set
			self.node_text.append(text)
		else:
			#get
			if self.node_text:
				node_text=''.join(self.node_text)
				self.pieces.append(self.highlight and self.process(node_text) or node_text)
				self.node_text=[]
	
	def process(self,text):
		text=self.Q_PATTERN.sub(r'<span class="highlight">\g<query></span>',text)
		return text
	def output(self):
		"""Return processed HTML as a single string"""
		return "".join(self.pieces)
