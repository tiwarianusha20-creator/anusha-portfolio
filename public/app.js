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
});