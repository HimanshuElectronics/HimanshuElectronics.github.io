(function(){
  var b=document.getElementById('burger'),n=document.getElementById('nav');
  if(b&&n){
    b.addEventListener('click',function(){
      var o=n.classList.toggle('open');b.classList.toggle('open',o);b.setAttribute('aria-expanded',o);
    });
    n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');b.classList.remove('open')}});
  }
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('in')})}
  // WhatsApp enquiry form
  var f=document.getElementById('waForm');
  if(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(f);
      var t='Hello Himanshu Electronics,%0A'+
        'Name: '+encodeURIComponent(d.get('name')||'')+'%0A'+
        'Phone: '+encodeURIComponent(d.get('phone')||'')+'%0A'+
        'Interested in: '+encodeURIComponent(d.get('topic')||'')+'%0A'+
        'Details: '+encodeURIComponent(d.get('msg')||'');
      window.open('https://wa.me/919639228237?text='+t,'_blank','noopener');
    });
  }
})();
