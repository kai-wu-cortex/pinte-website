import React from 'react';
import { SimulationState, CoatingMethod, SolventType, ProcessStep, Language } from './types';

interface ControlPanelProps {
  language: Language;
  state: SimulationState;
  onChange: (newState: SimulationState) => void;
}

const Slider = ({ label, value, min, max, step, unit, onChange, color = "blue", description }: any) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1 items-end">
      <span className="text-sm font-medium text-gray-200">{label}</span>
      <span className="text-xs font-mono text-yellow-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-600">
        {value} {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700/50 hover:bg-slate-600/50 transition-colors accent-${color}-500`}
    />
    {description && <p className="text-[10px] text-gray-400 mt-1">{description}</p>}
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ language, state, onChange }) => {

  const t = {
    en: {
      parameterConsole: 'Parameter Console',
      unwind: 'Unwind & Speed',
      lineSpeed: 'Line Speed',
      unwindTension: 'Unwind Tension',
      tooLowBubbles: 'Too low causes loose winding, too high causes deformation',
      preTreat: 'Pre-Treatment',
      coronaPower: 'Corona Power',
      improvesAdhesion: 'Improves surface adhesion, reduces craters',
      coating: 'Coating & Formula',
      coatingMethod: 'Coating Method',
      meshCount: 'Mesh Count',
      gapBar: 'Gap / Bar Number',
      speedRatio: 'Coating Speed Ratio',
      ratioEffect: 'Roll / Web speed ratio (affects micro gravure coating thickness)',
      viscosity: 'Viscosity',
      solidContent: 'Solid Content',
      levelingAgent: 'Leveling Agent',
      defoamer: 'Defoamer',
      solventType: 'Solvent Type',
      drying: 'Drying Oven',
      ovenTemp: 'Oven Temperature',
      tooHighEffect: 'Too high temperature may cause solvent boiling and orange peel effect',
      dryingEfficiency: 'Drying Efficiency',
      postProcess: 'Post Process & Tension',
      mainTension: 'Main System Tension',
      controlsFlatness: 'Controls web flatness along entire line',
      nipPressure: 'Lamination Nip Pressure',
      rewind: 'Rewind Unit',
      rewindTension: 'Rewind Tension',
      taperControl: 'Taper tension control prevents telescoping',
    },
    cn: {
      parameterConsole: '参数控制台',
      unwind: '放卷与速度',
      lineSpeed: '生产线速度',
      unwindTension: '放卷张力',
      tooLowBubbles: '过低导致松卷，过高导致变形',
      preTreat: '前处理',
      coronaPower: '电晕功率',
      improvesAdhesion: '提高表面附着力，减少缩孔',
      coating: '涂布与配方',
      coatingMethod: '涂布方式',
      meshCount: '网纹辊目数',
      gapBar: '模头间隙 / 棒号',
      speedRatio: '涂布速比',
      ratioEffect: '辊速/线速比 (主要影响微凹涂布膜厚)',
      viscosity: '粘度',
      solidContent: '固含量',
      levelingAgent: '流平剂',
      defoamer: '消泡剂',
      solventType: '溶剂类型',
      drying: '干燥烘箱',
      ovenTemp: '烘箱温度',
      tooHighEffect: '温度过高可能导致溶剂沸腾产生橘皮',
      dryingEfficiency: '干燥效率',
      postProcess: '后处理与主张力',
      mainTension: '系统主张力',
      controlsFlatness: '控制全线基材平整度',
      nipPressure: '复合压力',
      rewind: '收卷单元',
      rewindTension: '收卷张力',
      taperControl: '锥度张力控制，防止菜心',
    }
  }[language];

  const updateMachine = (key: string, val: number) => {
    onChange({ ...state, machine: { ...state.machine, [key]: val } });
  };
  
  const updateLiquid = (key: string, val: any) => {
    onChange({ ...state, liquid: { ...state.liquid, [key]: val } });
  };

  const updateAdditives = (key: string, val: number) => {
    onChange({ ...state, additives: { ...state.additives, [key]: val } });
  };

  const isStep = (s: ProcessStep) => state.step === s;
  const isOverview = state.step === ProcessStep.OVERVIEW;

  return (
    <div className="flex flex-col h-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full select-none text-white pointer-events-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 sticky top-0 z-10 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm rounded-t-lg">
        <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🎛️</span>
            <span>{t.parameterConsole}</span>
        </h2>
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-700/50">
                {state.step}
            </span>
        </div>
      </div>

      <div className="overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* 1. Global / Unwind Controls */}
        {(isOverview || isStep(ProcessStep.UNWIND)) && (
        <section className="animate-fade-in">
          <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-widest border-b border-blue-900/50 pb-1">
            {t.unwind}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Slider label={language === 'en' ? 'Line Speed' : '生产线速度'} value={state.machine.speed} min={5} max={150} step={1} unit="m/min" onChange={(v: number) => updateMachine('speed', v)} color="blue" description={language === 'en' ? 'Affects drying time and leveling' : '影响干燥时间和流平效果'} />
            <Slider label={t.unwindTension} value={state.machine.unwindTension} min={5} max={100} step={1} unit="N" onChange={(v: number) => updateMachine('unwindTension', v)} color="blue" description={t.tooLowBubbles} />
          </div>
        </section>
        )}

        {/* 2. Pre-Treatment */}
        {(isOverview || isStep(ProcessStep.PRETREAT)) && (
        <section className="animate-fade-in">
          <h3 className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-widest border-b border-indigo-900/50 pb-1">
            {t.preTreat}
          </h3>
          <div className="grid grid-cols-1 gap-4">
             <Slider label={t.coronaPower} value={state.machine.coronaPower} min={0} max={10} step={0.5} unit="kW" onChange={(v: number) => updateMachine('coronaPower', v)} color="indigo" description={t.improvesAdhesion} />
             <div className="opacity-70 grayscale">
                 <Slider label="纠偏灵敏度" value={80} min={0} max={100} step={1} unit="%" onChange={()=>{}} color="gray" description="EPC 系统参数 (模拟固定)" />
             </div>
          </div>
        </section>
        )}

        {/* 3. Coating Head & Liquid */}
        {(isOverview || isStep(ProcessStep.COATING)) && (
        <section className="animate-fade-in">
          <h3 className="text-xs font-bold text-purple-400 mb-3 uppercase tracking-widest border-b border-purple-900/50 pb-1">
            {t.coating}
          </h3>

          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-4">
             <div className="mb-4">
                <label className="block text-xs font-medium text-gray-300 mb-2">{t.coatingMethod}</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.values(CoatingMethod).map((method) => (
                        <button
                            key={method}
                            onClick={() => onChange({ ...state, coatingMethod: method as CoatingMethod })}
                            className={`text-[10px] p-2 rounded border transition-all ${state.coatingMethod === method ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-700/50 border-slate-600 text-gray-400 hover:bg-slate-600/50'}`}
                        >
                            {method.split(' ')[0]}
                        </button>
                    ))}
                </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                <Slider label={state.coatingMethod.includes('Micro') ? t.meshCount : t.gapBar}
                        value={state.machine.gapOrMesh} min={10} max={200} step={5} unit={state.coatingMethod.includes('Micro') ? "Mesh" : "μm"}
                        onChange={(v: number) => updateMachine('gapOrMesh', v)} color="purple"
                />
                <Slider label={t.speedRatio} value={state.machine.speedRatio} min={0.5} max={3.0} step={0.1} unit=": 1"
                        onChange={(v: number) => updateMachine('speedRatio', v)} color="purple" description={t.ratioEffect}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <Slider label={t.viscosity} value={state.liquid.viscosity} min={50} max={5000} step={50} unit="cps" onChange={(v: number) => updateLiquid('viscosity', v)} color="green" />
             <Slider label={t.solidContent} value={state.liquid.solidContent} min={10} max={80} step={1} unit="%" onChange={(v: number) => updateLiquid('solidContent', v)} color="green" />
             <Slider label={t.levelingAgent} value={state.additives.levelingAgent} min={0} max={100} step={5} unit="%" onChange={(v: number) => updateAdditives('levelingAgent', v)} color="emerald" />
             <Slider label={t.defoamer} value={state.additives.defoamer} min={0} max={100} step={5} unit="%" onChange={(v: number) => updateAdditives('defoamer', v)} color="emerald" />
          </div>

          <div className="mt-4">
             <label className="text-xs font-medium text-gray-300">{t.solventType}</label>
             <select
                 value={state.liquid.solventType}
                 onChange={(e) => updateLiquid('solventType', e.target.value)}
                 className="w-full mt-1 bg-slate-700/50 text-white text-xs rounded border border-slate-600 p-2 outline-none focus:border-purple-500"
             >
                 {Object.values(SolventType).map((t) => <option key={t} value={t}>{t}</option>)}
             </select>
          </div>
        </section>
        )}

        {/* 4. Drying */}
        {(isOverview || isStep(ProcessStep.DRYING)) && (
        <section className="animate-fade-in">
          <h3 className="text-xs font-bold text-orange-400 mb-3 uppercase tracking-widest border-b border-orange-900/50 pb-1">
            {t.drying}
          </h3>
          <Slider label={t.ovenTemp} value={state.machine.temperature} min={25} max={160} step={1} unit="°C" onChange={(v: number) => updateMachine('temperature', v)} color="orange" description={t.tooHighEffect} />
          <div className="p-3 bg-orange-900/20 border border-orange-800/50 rounded text-xs text-orange-200">
             🔥 {t.dryingEfficiency}: {Math.min(100, (state.machine.temperature / 120) * 100).toFixed(0)}%
          </div>
        </section>
        )}

        {/* 5. Post Process / Main Tension */}
        {(isOverview || isStep(ProcessStep.POST_PROCESS)) && (
        <section className="animate-fade-in">
          <h3 className="text-xs font-bold text-teal-400 mb-3 uppercase tracking-widest border-b border-teal-900/50 pb-1">
            {t.postProcess}
          </h3>
          <Slider label={t.mainTension} value={state.machine.tension} min={5} max={100} step={1} unit="N" onChange={(v: number) => updateMachine('tension', v)} color="teal" description={t.controlsFlatness} />
          <Slider label={t.nipPressure} value={state.machine.laminationPressure} min={1} max={10} step={0.1} unit="bar" onChange={(v: number) => updateMachine('laminationPressure', v)} color="teal" />
        </section>
        )}

        {/* 6. Rewind */}
        {(isOverview || isStep(ProcessStep.REWIND)) && (
        <section className="animate-fade-in">
          <h3 className="text-xs font-bold text-red-400 mb-3 uppercase tracking-widest border-b border-red-900/50 pb-1">
            {t.rewind}
          </h3>
          <Slider label={t.rewindTension} value={state.machine.rewindTension} min={10} max={120} step={1} unit="N" onChange={(v: number) => updateMachine('rewindTension', v)} color="red" description={t.taperControl} />
        </section>
        )}

      </div>
    </div>
  );
};