
import { Language } from '../types';

export const translations = {
  zh: {
    title: "NanoPixel 3D",
    subtitle: "多图粒子引擎",
    expand: "展开控制面板 (快捷键: N)",
    collapse: "收起面板 (快捷键: N)",
    upload: {
      title: "上传图片",
      desc: "点击选择或拖拽图片至此 (支持透明PNG)",
      processing: "矩阵计算中..."
    },
    shape: {
      title: "粒子形状",
      circle: "圆形",
      square: "方形",
      diamond: "菱形"
    },
    optics: {
      title: "相机光学",
      focus: "对焦距离",
      aperture: "光圈虚化"
    },
    geometry: {
      title: "几何参数",
      density: "采样密度 (越小越密)",
      size: "粒子大小",
      depth: "Z轴挤出深度",
      threshold: "透明度过滤 (去除背景)"
    },
    export: {
      title: "导出与保存",
      svg: "导出 SVG (当前视角)",
      ply: "导出 Blender (PLY模型)"
    },
    shortcuts: {
      title: "Blender 快捷键",
      front: "正视图",
      right: "右视图",
      top: "顶视图",
      reset: "重置相机",
      ui: "开关 UI"
    },
    context: {
      quickActions: "快捷操作",
      resetView: "重置视图",
      toggleUI: "切换界面",
      screenshot: "截图保存",
      frontView: "正视图",
      rightView: "右视图",
      topView: "顶视图"
    }
  },
  en: {
    title: "NanoPixel 3D",
    subtitle: "Multi-Image Engine",
    expand: "Expand Controls (Shortcut: N)",
    collapse: "Collapse Panel (Shortcut: N)",
    upload: {
      title: "Upload Images",
      desc: "Click or Drag & Drop (Supports PNG)",
      processing: "Processing Matrix..."
    },
    shape: {
      title: "Particle Shape",
      circle: "Circle",
      square: "Square",
      diamond: "Diamond"
    },
    optics: {
      title: "Camera Optics",
      focus: "Focus Distance",
      aperture: "Aperture Blur"
    },
    geometry: {
      title: "Geometry",
      density: "Density (Lower is denser)",
      size: "Particle Size",
      depth: "Z-Depth Extrusion",
      threshold: "Alpha Threshold (Cutout)"
    },
    export: {
      title: "Export",
      svg: "Export SVG (Current View)",
      ply: "Export Blender (.PLY)"
    },
    shortcuts: {
      title: "Blender Shortcuts",
      front: "Front View",
      right: "Right View",
      top: "Top View",
      reset: "Reset Cam",
      ui: "Toggle UI"
    },
    context: {
      quickActions: "Quick Actions",
      resetView: "Reset View",
      toggleUI: "Toggle UI",
      screenshot: "Screenshot",
      frontView: "Front View",
      rightView: "Right View",
      topView: "Top View"
    }
  }
};

export type TranslationType = typeof translations.en;
