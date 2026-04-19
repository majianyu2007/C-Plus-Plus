// ============================================================================
// 几何类模板 - 点、三角形、椭球、长方体等
// ============================================================================

#include <cmath>
#include <iomanip>
#include <iostream>
#include <vector>

using namespace std;

// ============================================================================
// 基础常数和工具
// ============================================================================

const double PI = 3.14159265358979323846;
const double EPS = 1e-8;  // 浮点数比较精度

inline bool equal(double a, double b, double eps = EPS) {
    return fabs(a - b) < eps;
}

inline double sqr(double x) {
    return x * x;
}


// ============================================================================
// 1. 点 (Point) - 基础几何元素
// ============================================================================
/*
 * 特性：
 * - 二维平面上的点
 * - 支持点间距离计算
 * 
 * 应用：作为其他几何图形的基础
 */

class Point {
public:
    double x, y;
    
    // 构造函数
    Point(double x = 0.0, double y = 0.0) : x(x), y(y) {}
    
    // 计算到另一点的距离
    double distanceTo(const Point& other) const {
        double dx = x - other.x;
        double dy = y - other.y;
        return sqrt(dx * dx + dy * dy);
    }
    
    // 两点间距离（静态函数）
    static double distance(const Point& a, const Point& b) {
        return a.distanceTo(b);
    }
    
    // 中点
    static Point midpoint(const Point& a, const Point& b) {
        return Point((a.x + b.x) / 2.0, (a.y + b.y) / 2.0);
    }
};


// ============================================================================
// 2. 三角形 (Triangle) - 海伦公式
// ============================================================================
/*
 * 原理：
 * - 使用三边长度计算面积（海伦公式）
 * - 面积 = √[p(p-a)(p-b)(p-c)]，其中 p = (a+b+c)/2
 * 
 * 时间复杂度：O(1)
 * 
 * 应用场景：
 * - 平面三角形计算
 * - 几何碰撞检测
 * - 计算几何应用
 */

class Triangle {
private:
    Point a, b, c;
    
public:
    // 构造函数
    Triangle(const Point& a, const Point& b, const Point& c)
        : a(a), b(b), c(c) {}
    
    // 计算三边长
    double sideAB() const { return a.distanceTo(b); }
    double sideBC() const { return b.distanceTo(c); }
    double sideCA() const { return c.distanceTo(a); }
    
    // 计算周长
    double perimeter() const {
        return sideAB() + sideBC() + sideCA();
    }
    
    // 使用海伦公式计算面积
    // 面积 = √[p(p-a)(p-b)(p-c)]
    double area() const {
        double ab = sideAB();
        double bc = sideBC();
        double ca = sideCA();
        double p = (ab + bc + ca) / 2.0;
        
        // 检查是否为有效三角形
        if (p <= ab || p <= bc || p <= ca) {
            return 0.0;
        }
        
        double area2 = p * (p - ab) * (p - bc) * (p - ca);
        return sqrt(fmax(area2, 0.0));
    }
    
    // 计算内切圆半径
    double inradius() const {
        double p = perimeter() / 2.0;
        double a_val = area();
        if (a_val < EPS) return 0.0;
        return a_val / p;
    }
    
    // 计算外接圆半径
    double circumradius() const {
        double ab = sideAB();
        double bc = sideBC();
        double ca = sideCA();
        double a_val = area();
        if (a_val < EPS) return 0.0;
        return (ab * bc * ca) / (4.0 * a_val);
    }
};


// ============================================================================
// 3. 椭球体 (Ellipsoid) - 三轴椭球
// ============================================================================
/*
 * 参数：
 * - a, b, c: 三个半轴长
 * 
 * 公式：
 * - 体积 = (4/3)π·a·b·c
 * 
 * 特殊情况：
 * - 球体：a = b = c = r，V = (4/3)πr³
 * - 椭球体：a ≠ b ≠ c
 * 
 * 时间复杂度：O(1)
 */

class Ellipsoid {
private:
    double a, b, c;  // 三个半轴长
    
public:
    // 构造函数
    Ellipsoid(double a = 1.0, double b = 1.0, double c = 1.0)
        : a(a), b(b), c(c) {}
    
    // 获取半轴
    double getA() const { return a; }
    double getB() const { return b; }
    double getC() const { return c; }
    
    // 计算体积：V = (4/3)π·a·b·c
    double getVolume() const {
        return (4.0 / 3.0) * PI * a * b * c;
    }
    
    // 计算表面积（近似公式）
    // 使用 Knud Thomsen 的近似公式
    double getSurfaceArea() const {
        double p = 1.6075;  // 近似参数
        double t1 = pow(a * b, p) + pow(b * c, p) + pow(c * a, p);
        double t2 = pow(3.0, 1.0 / p);
        return 4 * PI * pow(t1 / 3.0, 1.0 / p);
    }
    
    // 是否为球体
    bool isSphere() const {
        return equal(a, b) && equal(b, c);
    }
};


// ============================================================================
// 4. 长方体 (Cuboid) - 三维矩形体
// ============================================================================
/*
 * 特性：
 * - 三条边长：长 L、宽 W、高 H
 * - 需要比较两个长方体是否相同
 * 
 * 关键实现：
 * - 排序三边后比较（因为旋转不影响相等性）
 * 
 * 应用场景：
 * - 3D 物体碰撞检测
 * - 立方体堆积问题
 */

class Cuboid {
private:
    double length, width, height;
    
    // 冒泡排序辅助函数
    static void bubbleSort(double arr[], int n) {
        for (int i = 1; i < n; i++) {
            bool swapped = false;
            for (int j = n - 1; j >= i; j--) {
                if (arr[j - 1] > arr[j]) {
                    swap(arr[j - 1], arr[j]);
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
    
public:
    // 构造函数
    Cuboid(double l = 1.0, double w = 1.0, double h = 1.0)
        : length(l), width(w), height(h) {}
    
    // 获取体积
    double getVolume() const {
        return length * width * height;
    }
    
    // 获取表面积
    double getSurfaceArea() const {
        return 2 * (length * width + width * height + height * length);
    }
    
    // 获取对角线长度
    double getDiagonalLength() const {
        return sqrt(length * length + width * width + height * height);
    }
    
    // 判断两个长方体是否相同（排序后比较）
    bool isEqual(const Cuboid& other) const {
        double side1[3] = {length, width, height};
        double side2[3] = {other.length, other.width, other.height};
        
        bubbleSort(side1, 3);
        bubbleSort(side2, 3);
        
        for (int i = 0; i < 3; i++) {
            if (!equal(side1[i], side2[i])) {
                return false;
            }
        }
        return true;
    }
};


// ============================================================================
// 5. 矩形 (Rectangle) - 平面矩形
// ============================================================================
/*
 * 特性：
 * - 由中心点、宽度、高度定义
 * - 计算面积、周长、对角线
 * 
 * 时间复杂度：所有操作 O(1)
 */

class Rectangle {
private:
    Point center;
    double width, height;
    
public:
    // 构造函数
    Rectangle(const Point& center, double w, double h)
        : center(center), width(w), height(h) {}
    
    // 计算面积
    double getArea() const {
        return width * height;
    }
    
    // 计算周长
    double getPerimeter() const {
        return 2 * (width + height);
    }
    
    // 计算对角线长度
    double getDiagonalLength() const {
        return sqrt(width * width + height * height);
    }
    
    // 获取四个顶点
    vector<Point> getCorners() const {
        double dx = width / 2.0;
        double dy = height / 2.0;
        vector<Point> corners = {
            Point(center.x - dx, center.y - dy),
            Point(center.x + dx, center.y - dy),
            Point(center.x + dx, center.y + dy),
            Point(center.x - dx, center.y + dy)
        };
        return corners;
    }
};


// ============================================================================
// 6. 圆 (Circle) - 平面圆
// ============================================================================

class Circle {
private:
    Point center;
    double radius;
    
public:
    // 构造函数
    Circle(const Point& center, double r)
        : center(center), radius(r) {}
    
    // 获取面积
    double getArea() const {
        return PI * radius * radius;
    }
    
    // 获取周长
    double getPerimeter() const {
        return 2 * PI * radius;
    }
    
    // 判断点是否在圆内
    bool containsPoint(const Point& p) const {
        return center.distanceTo(p) <= radius + EPS;
    }
    
    // 获取圆周上的点（参数化表示）
    Point getPointAt(double angle) const {
        return Point(
            center.x + radius * cos(angle),
            center.y + radius * sin(angle)
        );
    }
};


// ============================================================================
// 使用示例
// ============================================================================

/*
int main() {
    // 三角形示例
    {
        cout << "=== Triangle Demo ===\n";
        Point p1(0, 0), p2(3, 0), p3(0, 4);
        Triangle tri(p1, p2, p3);
        cout << "Perimeter: " << tri.perimeter() << "\n";
        cout << "Area: " << tri.area() << "\n";
    }
    
    // 椭球体示例
    {
        cout << "\n=== Ellipsoid Demo ===\n";
        Ellipsoid e(3, 2, 1);
        cout << "Volume: " << e.getVolume() << "\n";
    }
    
    // 长方体示例
    {
        cout << "\n=== Cuboid Demo ===\n";
        Cuboid c1(3, 4, 5);
        Cuboid c2(4, 5, 3);  // 相同的长方体
        cout << "Are equal: " << (c1.isEqual(c2) ? "yes" : "no") << "\n";
    }
    
    // 矩形示例
    {
        cout << "\n=== Rectangle Demo ===\n";
        Rectangle rect(Point(0, 0), 6, 4);
        cout << "Area: " << rect.getArea() << "\n";
        cout << "Diagonal: " << rect.getDiagonalLength() << "\n";
    }
    
    return 0;
}
*/
