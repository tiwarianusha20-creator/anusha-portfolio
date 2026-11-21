document.addEventListener('DOMContentLoaded',()=>{
  const menu=document.getElementById('menuToggle');
  const nav=document.getElementById('navLinks');
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰';});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');if(menu)menu.textContent='☰';}));
  document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const filter=btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;});
  }));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  document.getElementById('year').textContent=new Date().getFullYear();
  const form=document.getElementById('contactForm'),note=document.getElementById('formNote'),submit=document.getElementById('submitBtn');
  form?.addEventListener('submit',async e=>{
    e.preventDefault();note.textContent='Sending your message…';submit.disabled=true;
    const payload=Object.fromEntries(new FormData(form).entries());
    try{
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.error||'Something went wrong. Please try again.');
      form.reset();note.textContent='Thank you — your message has been received. I’ll be in touch.'; 
    }catch(err){note.textContent=err.message||'Could not send your message. Please email me directly.';}
    finally{submit.disabled=false;}
  });

  // Accessible lightbox for portfolio artwork
  const artworkImages=[...document.querySelectorAll('.project-art img')];
  if(artworkImages.length){
    const lightbox=document.createElement('div');
    lightbox.className='lightbox';
    lightbox.id='portfolioLightbox';
    lightbox.setAttribute('role','dialog');
    lightbox.setAttribute('aria-modal','true');
    lightbox.setAttribute('aria-label','Portfolio image preview');
    lightbox.innerHTML=`
      <div class="lightbox-panel">
        <div class="lightbox-toolbar">
          <div class="lightbox-title" id="lightboxTitle">Portfolio preview</div>
          <div class="lightbox-controls">
            <button class="lightbox-control" type="button" id="lightboxPrev" aria-label="Previous image">‹</button>
            <button class="lightbox-control" type="button" id="lightboxNext" aria-label="Next image">›</button>
            <button class="lightbox-control" type="button" id="lightboxClose" aria-label="Close preview">×</button>
          </div>
        </div>
        <div class="lightbox-stage"><img class="lightbox-image" id="lightboxImage" alt=""></div>
        <div class="lightbox-caption" id="lightboxCaption"></div>
      </div>`;
    document.body.appendChild(lightbox);
    const preview=lightbox.querySelector('#lightboxImage');
    const title=lightbox.querySelector('#lightboxTitle');
    const caption=lightbox.querySelector('#lightboxCaption');
    let activeIndex=0,lastFocused=null;
    const showImage=index=>{
      activeIndex=(index+artworkImages.length)%artworkImages.length;
      const source=artworkImages[activeIndex];
      preview.src=source.currentSrc||source.src;
      preview.alt=source.alt||'Portfolio artwork';
      title.textContent=source.closest('.project-card')?.querySelector('h3')?.textContent||'Portfolio preview';
      caption.textContent=(activeIndex+1)+' / '+artworkImages.length+'  ·  Click outside or press Esc to close';
    };
    const close=()=>{
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      preview.removeAttribute('src');
      lastFocused?.focus();
    };
    artworkImages.forEach((img,index)=>{
      img.tabIndex=0;
      img.setAttribute('role','button');
      img.setAttribute('aria-label','Enlarge '+(img.alt||'portfolio artwork'));
      const open=()=>{lastFocused=img;showImage(index);lightbox.classList.add('open');document.body.classList.add('lightbox-open');lightbox.querySelector('#lightboxClose').focus();};
      img.addEventListener('click',open);
      img.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
    });
    lightbox.querySelector('#lightboxClose').addEventListener('click',close);
    lightbox.querySelector('#lightboxPrev').addEventListener('click',()=>showImage(activeIndex-1));
    lightbox.querySelector('#lightboxNext').addEventListener('click',()=>showImage(activeIndex+1));
    lightbox.addEventListener('click',event=>{if(event.target===lightbox)close();});
    document.addEventListener('keydown',event=>{
      if(!lightbox.classList.contains('open'))return;
      if(event.key==='Escape')close();
      if(event.key==='ArrowLeft')showImage(activeIndex-1);
      if(event.key==='ArrowRight')showImage(activeIndex+1);
    });
  }
});