// ============================================================================
// OOP 设计模板 - 虚函数、多态、继承设计
// ============================================================================

#include <iomanip>
#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

using namespace std;

// ============================================================================
// 1. 虚函数与多态基础模板
// ============================================================================
/*
 * 应用场景：需要实现不同对象的不同行为
 * 特点：
 * - 虚函数：允许子类重写基类方法
 * - 多态：编译时类型 vs 运行时实际类型
 * - 开闭原则：对扩展开放，对修改关闭
 * - 性能：O(1) 虚函数调用（虚表查询）
 */

class Shape {
public:
    Shape(double x, double y) : x_(x), y_(y) {}
    virtual ~Shape() {}  // 必须有虚析构函数！
    
    // 纯虚函数：强制子类实现
    virtual void draw(std::ostream& os) const = 0;
    virtual double getArea() const = 0;
    
    // 普通虚函数：子类可选重写
    virtual void scale(double factor) { /* 默认实现 */ }
    
    // 非虚函数：所有对象共享
    void move(double dx, double dy) {
        x_ += dx;
        y_ += dy;
    }
    
protected:
    double x_;
    double y_;
};

// 具体实现类 - 矩形
class Rectangle : public Shape {
public:
    Rectangle(double x, double y, double w, double h)
        : Shape(x, y), width_(w), height_(h) {}
    
    void draw(std::ostream& os) const override {
        os << "Rectangle at (" << x_ << ", " << y_ 
           << ") size=" << width_ << "x" << height_;
    }
    
    double getArea() const override {
        return width_ * height_;
    }
    
    void scale(double factor) override {
        width_ *= factor;
        height_ *= factor;
    }

private:
    double width_;
    double height_;
};

// 具体实现类 - 圆形
class Circle : public Shape {
public:
    Circle(double x, double y, double r)
        : Shape(x, y), radius_(r) {}
    
    void draw(std::ostream& os) const override {
        os << "Circle at (" << x_ << ", " << y_ 
           << ") radius=" << radius_;
    }
    
    double getArea() const override {
        return 3.14159 * radius_ * radius_;
    }
    
    void scale(double factor) override {
        radius_ *= factor;
    }

private:
    double radius_;
};


// ============================================================================
// 2. 深拷贝与浅拷贝管理
// ============================================================================
/*
 * 场景：类包含指针或动态分配资源
 * 关键点：
 * - 默认浅拷贝：只复制指针，多个对象指向同一块内存
 * - 深拷贝：复制指针指向的数据
 * - 移动语义：C++11 高效资源转移
 */

class DynamicResource {
public:
    // 构造函数：分配资源
    DynamicResource(int size) : data_(new int[size]), size_(size) {
        std::cout << "Construct: alloc " << size << " ints\n";
    }
    
    // 深拷贝构造函数
    DynamicResource(const DynamicResource& other) 
        : size_(other.size_), data_(new int[other.size_]) {
        std::copy(other.data_, other.data_ + other.size_, data_);
        std::cout << "Copy construct: deep copy\n";
    }
    
    // 深拷贝赋值
    DynamicResource& operator=(const DynamicResource& other) {
        if (this == &other) return *this;
        
        delete[] data_;  // 释放旧资源
        size_ = other.size_;
        data_ = new int[other.size_];
        std::copy(other.data_, other.data_ + other.size_, data_);
        std::cout << "Copy assign: deep copy\n";
        return *this;
    }
    
    // 移动构造函数 (C++11)
    DynamicResource(DynamicResource&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
        std::cout << "Move construct: move semantics\n";
    }
    
    // 移动赋值
    DynamicResource& operator=(DynamicResource&& other) noexcept {
        if (this == &other) return *this;
        
        delete[] data_;
        data_ = other.data_;
        size_ = other.size_;
        other.data_ = nullptr;
        other.size_ = 0;
        std::cout << "Move assign: move semantics\n";
        return *this;
    }
    
    // 析构函数：释放资源
    ~DynamicResource() {
        delete[] data_;
        std::cout << "Destruct: free resource\n";
    }

private:
    int* data_;
    int size_;
};


// ============================================================================
// 3. 智能指针管理多态对象
// ============================================================================
/*
 * 场景：动态创建和管理不同类型的对象集合
 * 优势：自动内存管理，异常安全
 * 性能：零开销抽象（与手动 new/delete 相同）
 */

class ShapeManager {
public:
    // 添加形状（接受智能指针）
    void addShape(std::unique_ptr<Shape> shape) {
        shapes_.push_back(std::move(shape));
    }
    
    // 绘制所有形状
    void drawAll(std::ostream& os) const {
        for (size_t i = 0; i < shapes_.size(); ++i) {
            os << i + 1 << ". ";
            shapes_[i]->draw(os);
            os << "\n";
        }
    }
    
    // 计算总面积
    double getTotalArea() const {
        double total = 0.0;
        for (const auto& shape : shapes_) {
            total += shape->getArea();
        }
        return total;
    }
    
    // 缩放所有形状
    void scaleAll(double factor) {
        for (auto& shape : shapes_) {
            shape->scale(factor);
        }
    }

private:
    std::vector<std::unique_ptr<Shape>> shapes_;
};


// ============================================================================
// 4. 异常处理与设计
// ============================================================================
/*
 * 原则：
 * - 异常安全保证：基本、强、无异常
 * - 使用 RAII 自动释放资源
 * - 只在异常情况下使用异常
 */

class ValidatedData {
public:
    ValidatedData(int value) {
        setValue(value);  // 异常安全地初始化
    }
    
    void setValue(int value) {
        if (value < 0 || value > 100) {
            throw std::invalid_argument("Value must be in [0, 100]");
        }
        value_ = value;
    }
    
    int getValue() const { return value_; }

private:
    int value_;
};


// ============================================================================
// 5. 模板方法模式
// ============================================================================
/*
 * 定义算法框架，让子类实现具体步骤
 */

class DataProcessor {
public:
    virtual ~DataProcessor() {}
    
    // 模板方法：定义算法流程
    void process(const std::vector<int>& data) {
        std::cout << "Step 1: Prepare\n";
        prepare();
        
        std::cout << "Step 2: Process\n";
        doProcess(data);
        
        std::cout << "Step 3: Finish\n";
        finish();
    }

protected:
    virtual void prepare() {}
    virtual void doProcess(const std::vector<int>& data) = 0;
    virtual void finish() {}
};

class SumProcessor : public DataProcessor {
protected:
    void doProcess(const std::vector<int>& data) override {
        int sum = 0;
        for (int x : data) sum += x;
        std::cout << "Sum = " << sum << "\n";
    }
};


// ============================================================================
// 使用示例
// ============================================================================

/*
int main() {
    // 1. 多态基础
    {
        ShapeManager manager;
        manager.addShape(std::unique_ptr<Shape>(new Rectangle(0, 0, 10, 5)));
        manager.addShape(std::unique_ptr<Shape>(new Circle(0, 0, 3)));
        
        std::cout << "Shapes:\n";
        manager.drawAll(std::cout);
        std::cout << "Total area: " << manager.getTotalArea() << "\n\n";
    }
    
    // 2. 深拷贝
    {
        DynamicResource r1(5);
        DynamicResource r2 = r1;  // 深拷贝
        DynamicResource r3 = std::move(r1);  // 移动语义
    }
    
    // 3. 异常处理
    {
        try {
            ValidatedData data(150);  // 抛异常
        } catch (const std::invalid_argument& e) {
            std::cout << "Error: " << e.what() << "\n";
        }
    }
    
    return 0;
}
*/
