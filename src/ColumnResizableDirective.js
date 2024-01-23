export default {
  install(app) {
    app.directive('columns-resizable', {
      mounted(el) {
        const nodeName = el.nodeName;
        if (['TABLE', 'THEAD'].indexOf(nodeName) < 0) return;

        let table = nodeName === 'TABLE' ? el : el.parentElement;
        const thead = table.querySelector('thead');

        const resizeContainer = document.createElement('div');
        table.style.position = 'relative';
        table.style.width = 'auto';
        resizeContainer.style.position = 'relative';
        resizeContainer.style.width = table.offsetWidth + 'px';
        resizeContainer.className = "vue-columns-resizable";
        table.parentElement.insertBefore(resizeContainer, table);

        let moving = false;
        let movingIndex = 0;

        const updateColumns = () => {

          resizeContainer.style.width = table.offsetWidth + 'px';

          const ths = thead.querySelectorAll('th');
          const barHeight = nodeName === 'TABLE' ? table.offsetHeight : thead.offsetHeight;

          ths.forEach((th, index) => {
            th.style.width = th.offsetWidth + 'px';
            const bar = document.createElement('div');
            if ( index + 1 >= ths.length) {
             
              bar.style.left = ths[0].offsetLeft + table.offsetWidth - 4 + 'px';

            }else{
              const nextTh = ths[index + 1];
              bar.style.left = nextTh.offsetLeft - 4 + 'px';
            }
          

            bar.style.position = 'absolute';
            bar.style.top = 0;
            bar.style.height = barHeight + 'px';
            bar.style.width = '8px';
           // bar.style.backgroundColor='green';
            if(!th.getAttribute('freeze'))
              bar.style.cursor = 'col-resize';
            bar.style.zIndex = 3;
            bar.className = 'columns-resize-bar';

            bar.addEventListener('mousedown', () => {
              moving = true;
              movingIndex = index;
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            });

            resizeContainer.appendChild(bar);
          });

          const bars = resizeContainer.querySelectorAll('.columns-resize-bar');

          document.addEventListener('mouseup', () => {
            if (!moving) return;

            moving = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            bars.forEach((bar, index) => {
              const th = ths[index];
            
                bar.style.left = th.offsetLeft+th.offsetWidth - 4 + 'px';
              

            });
          });

          const cutPx = str => +str.replace('px', '');

          const handleResize = e => {
            if (moving) {

              const th = ths[movingIndex];
              if(th.getAttribute('freeze'))return;
              let width = cutPx(th.style.width) + e.movementX;
              th.style.width = width + 'px';
              const bar = bars[movingIndex];

              if(movingIndex + 1<ths.length){

              
              const nextTh = ths[movingIndex + 1];
             // nextTh.style.width = cutPx(nextTh.style.width) - e.movementX + 'px';
             console.log(th.offsetLeft,e.movementX,width);

              bar.style.left = cutPx(bar.style.left)+e.movementX + 'px';
            }else{
              console.log(ths[0].offsetLeft+table.offsetWidth,e.movementX,width);

              bar.style.left = ths[0].offsetLeft+table.offsetWidth - 4 + e.movementX + 'px';

            }
            }
          };

          resizeContainer.addEventListener('mousemove', handleResize);
          table.addEventListener('mousemove', handleResize);
        };

        updateColumns();

        const observer = new MutationObserver(updateColumns);
        const observerConfig = { childList: true, subtree: true };
        observer.observe(thead, observerConfig);
      },
    });

  },
};