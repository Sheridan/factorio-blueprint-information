class CTable
{
  constructor(columns, title)
  {
    this.columns = columns;
    this.title = title;
    this.makeHeader();
  }

  makeHeader()
  {
    this.table = document.createElement('table');
    const header = this.table.createTHead();
    this.table.createCaption().innerHTML = this.title;

    let row = "";
    for(const value of this.columns)
    {
      row += `<th>${value}</th>`
    }
    const headerRow = header.insertRow().innerHTML = row;
    this.body = this.table.createTBody();
  }

  appendRow(values)
  {
    let row = '';
    for(const value of values)
    {
      row += `<td>${value}</td>`
    }
    this.body.insertRow().innerHTML = row;
  }

  appendFooter(content)
  {
    this.table.createTFoot().insertRow().innerHTML = `<td colspan='${this.columns.length}' style='align: right;'>${content}</td>`;
  }
  addSorting() {
    const headers = this.table.querySelectorAll('th');
    headers.forEach((header, index) => {
      header.addEventListener('click', () => {
        const rows = Array.from(this.table.rows).slice(1, -1); // Исключаем заголовок и подвал
        const isAscending = header.classList.toggle('ascending');
        const direction = isAscending ? 1 : -1;

        rows.sort((a, b) => {
          const aText = a.cells[index].innerText;
          const bText = b.cells[index].innerText;

          const aValue = this.parseValue(aText);
          const bValue = this.parseValue(bText);

          if (aValue < bValue) return -1 * direction;
          if (aValue > bValue) return 1 * direction;
          return 0;
        });

        rows.forEach(row => this.table.appendChild(row));
      });
    });
  }

  parseValue(text) {
    const suffixes = {
      'T': 1e12, // Тера
      'G': 1e9,  // Гига
      'M': 1e6,  // Мега
      'k': 1e3,  // Кило
      '': 1,      // Базовая единица
      'm': 1e-3,  // Милли
      'µ': 1e-6,  // Микро
      'n': 1e-9,  // Нано
      'p': 1e-12, // Пико
      'f': 1e-15, // Фемто
    };

    const match = text.match(/^([\d.]+)([TGMkµnpf]?).*$/);
    if (match) {
      const value = parseFloat(match[1]);
      const suffix = match[2];
      return value * (suffixes[suffix] || 1);
    }

    return parseFloat(text); // Если не удалось распарсить, возвращаем как есть
  }
  apply(parent)
  {
    this.addSorting();
    parent.appendChild(this.table);
  }
}

class Blueprint
{
  static heatSource =
  {
    'heating-tower':
    {
      'normal':    40,
      'uncommon':  52,
      'rare':      64,
      'epic':      76,
      'legendary': 100,
    },
    'nuclear-reactor':
    {
      'normal':    40,
      'uncommon':  52,
      'rare':      64,
      'epic':      76,
      'legendary': 100,
    },
  }
  static nuclearPower =
  {
    'normal':    40,
    'uncommon':  52,
    'rare':      64,
    'epic':      76,
    'legendary': 100,
  };

  static heatTowerPower =
  {
    'normal':    40,
    'uncommon':  52,
    'rare':      64,
    'epic':      76,
    'legendary': 100,
  };

  static heatTowerPowerConsumption =
  {
    'normal':      16,
    'uncommon':  20.8,
    'rare':      25.6,
    'epic':      30.4,
    'legendary':   40,
  };

  static aquiloHeatCost = {
    'arithmetic-combinator':      50,
    'assembling-machine-1':       100,
    'assembling-machine-2':       100,
    'assembling-machine-3':       100,
    'beacon':                     400,
    'biochamber':                 100,
    'bulk-inserter':              50,
    'centrifuge':                 100,
    'chemical-plant':             100,
    'cryogenic-plant':            100,
    'decider-combinator':         50,
    'electric-furnace':           100,
    'electromagnetic-plant':      100,
    'express-splitter':           40,
    'express-transport-belt':     10,
    'express-underground-belt':   150,
    'fast-inserter':              30,
    'fast-splitter':              40,
    'fast-transport-belt':        10,
    'fast-underground-belt':      100,
    'foundry':                    300,
    'inserter':                   30,
    'lab':                        100,
    'long-handed-inserter':       50,
    'oil-refinery':               200,
    'pipe-to-ground':             150,
    'pipe':                       1,
    'power-switch':               20,
    'pump':                       30,
    'pumpjack':                   50,
    'recycler':                   100,
    'roboport':                   300,
    'rocket-silo':                300,
    'selector-combinator':        100,
    'splitter':                   40,
    'stack-inserter':             50,
    'steam-engine':               50,
    'steam-turbine':              50,
    'storage-tank':               100,
    'transport-belt':             10,
    'turbo-splitter':             30,
    'turbo-transport-belt':       10,
    'turbo-underground-belt':     200,
    'underground-belt':           50,
  };

  static rails = [
    'elevated-half-diagonal-rail',
    'elevated-curved-rail-a',
    'elevated-curved-rail-b',
    'elevated-straight-rail',
    'half-diagonal-rail',
    'curved-rail-a',
    'curved-rail-b',
    'straight-rail',
  ];

  constructor(content)
  {
    this.element_counts = document.getElementById('counts');
    this.element_heat = document.getElementById('heat');
    this.data = this.encode(content);
    this.entityties = {};
  }

  encode(content)
  {
    const binaryString = atob(content);
    const charCodeArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++)
    {
      charCodeArray[i] = binaryString.charCodeAt(i);
    }
    const decompressed = pako.inflate(charCodeArray);
    return JSON.parse(new TextDecoder().decode(decompressed));
  }

  nameAsWiki(str)
  {
    if(str == 'small-lamp') { str = 'lamp'; }
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, '_');
  }

  appendEntity(entity)
  {
    // console.log(entity);
    let entity_name = entity.name;
    if (Blueprint.rails.includes(entity_name))
    {
      entity_name = 'rail';
    }
    if (!this.entityties[entity_name])
    {
      this.entityties[entity_name] =
      {
        'count': 0,
        'entities': []
      };
    }
    this.entityties[entity_name]['count'] += 1;
    this.entityties[entity_name]['entities'].push(entity);
  }

  makeIcon(name) { return `<span class='icon ${name}'></span>`; }
  makeQalityIcon(name) { return `<img class='icon' src='https://wiki.factorio.com/images/thumb/Quality_${name}.png/32px-Quality_${name}.png' />`; }
  //
  makeWikiLink(name, caption = '')
  {
    return `<a href='https://wiki.factorio.com/${this.nameAsWiki(name)}' target='_blank'>${caption == '' ? name : caption}</a>`;
  }

  countEntities()
  {
    for (const entity of this.data.blueprint.entities)
    {
      this.appendEntity(entity);
    }

    const table = new CTable(['Icon', 'Name', 'Count'], 'Entities count');
    let totalCount = 0;
    for (const [name, entity] of Object.entries(this.entityties))
    {
      table.appendRow([
        this.makeIcon(name),
        this.makeWikiLink(name),
        `${entity.count}`
      ]);
      totalCount += entity.count;
    }

    table.appendFooter(`Total: ${totalCount}`);
    table.apply(this.element_counts);
  }

  calcAquiloHeat()
  {
    const table = new CTable(['Icon', 'Name', 'Count','Heat per one', 'Heat need'], 'Aquilo heating need');
    let totalHeat = 0;
    for (const [name, entity] of Object.entries(this.entityties))
    {
      if (name in Blueprint.aquiloHeatCost)
      {
        const entityHeat = entity.count * Blueprint.aquiloHeatCost[name] * 1000;
        table.appendRow([
          this.makeIcon(name),
          this.makeWikiLink(name),
          `${entity.count}`,
          this.formatNumber(Blueprint.aquiloHeatCost[name], 'W', 2),
          this.formatNumber(entityHeat, 'W', 2)
        ]);
        totalHeat += entityHeat;
      }
    }
    table.appendFooter(`Total: ${this.formatNumber(totalHeat, 'W', 2)}`);
    table.apply(this.element_heat);

    this.calcAquiloHeatTowers(totalHeat, 'nuclear-reactor');
    this.calcAquiloHeatTowers(totalHeat, 'heating-tower');
  }

  calcAquiloHeatTowers(heatNeed, heatSource)
  {
    const table = new CTable(['Quality', 'Count'], this.makeIcon(heatSource) + '&nbsp;' + this.makeWikiLink(heatSource));
    for (const [quality, power] of Object.entries(Blueprint.heatSource[heatSource]))
    {
      let towers = heatNeed / (power * 1000000);
      table.appendRow([
        this.makeQalityIcon(quality),
        this.round(towers, 2)
      ]);
      table.apply(this.element_heat);
    }
  }

  round(value, decimals)
  {
    return parseFloat(value.toFixed(decimals)).toString();
  }
  formatNumber(value, unit, decimals)
  {
    const units = [
      { suffix: 'T', factor: 1e12 }, // Тера
      { suffix: 'G', factor: 1e9 },  // Гига
      { suffix: 'M', factor: 1e6 },  // Мега
      { suffix: 'k', factor: 1e3 },  // Кило
      { suffix: '', factor: 1 },      // Базовая единица
      { suffix: 'm', factor: 1e-3 },  // Милли
      { suffix: 'µ', factor: 1e-6 },  // Микро
      { suffix: 'n', factor: 1e-9 },  // Нано
      { suffix: 'p', factor: 1e-12 }, // Пико
      { suffix: 'f', factor: 1e-15 }, // Фемто
    ];

    if (value === 0) {
      return `0${unit}`; // Обработка нуля
    }

    let formattedValue = value;
    let suffix = '';

    for (const { suffix: currentSuffix, factor } of units) {
      if (Math.abs(formattedValue) >= factor) {
        formattedValue = formattedValue / factor;
        suffix = currentSuffix;
        break;
      }
    }

    return `${this.round(formattedValue, decimals)}${suffix}${unit}`;
  }


  clearOutput()
  {
    this.element_counts.innerHTML = '';
    this.element_heat.innerHTML = '';
  }

  echoNL(text) { this.echo(text + '<br />'); }
  echo(text) { this.element_counts.innerHTML += text; }

  main()
  {
    this.clearOutput();
    this.countEntities();
    this.calcAquiloHeat();
  }
}

// Обработка события нажатия кнопки
document.getElementById('decodeButton').addEventListener('click',
  () =>
    {
      const blueprint_string = document.getElementById('blueprint_string').value.trim();
      if (blueprint_string)
      {
        const blueprint = new Blueprint(blueprint_string.slice(1));
        blueprint.main();
      }
      else
      {
        alert('Пожалуйста, введите base64 строку.');
    }
});

document.getElementById('clearButton').addEventListener('click',
  () => { document.getElementById('blueprint_string').value = ""; });

  document.getElementById('pasteButton').addEventListener('click', async () =>
  {
    try
    {
      const text = await navigator.clipboard.readText();
      document.getElementById('blueprint_string').value = text;
    }
    catch (err)
    {
      console.error('Ошибка при чтении буфера обмена: ', err);
    }
  });
